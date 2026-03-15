from apscheduler.schedulers.background import BackgroundScheduler
from services.db import db_client
from services.notifications import send_reminder_email
from config import settings
from datetime import datetime, timezone, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_reminders():
    """Check all pending tasks and send reminders at 24h, 3h, and 30m before deadline."""
    now = datetime.now(timezone.utc)
    
    try:
        tasks = db_client.get_pending_tasks_with_deadlines()
        
        for task in tasks:
            user_id = task.get('user_id')
            if not user_id:
                continue
            
            # Fetch user profile for email and preferences
            profile = db_client.get_user_profile(user_id)
            if not profile or not profile.get('email_reminders'):
                continue
                
            to_email = profile.get('email')
            if not to_email:
                continue

            deadline_str = task.get('deadline')
            if not deadline_str:
                continue
                
            deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            time_diff = deadline - now
            
            # Staggered intervals
            intervals = [
                (timedelta(days=1), "24h"),
                (timedelta(hours=3), "3h"),
                (timedelta(minutes=30), "30m"),
            ]
            
            for delta, label in intervals:
                # If we are within the threshold for this interval and it's not too late
                if timedelta(0) < time_diff <= delta:
                    # check if already sent for THIS label
                    reminders = db_client.check_reminder_sent(task['id'], label)
                    if len(reminders) > 0:
                        continue
                        
                    # Send Email
                    logger.info(f"Triggering {label} reminder for {to_email} - task: {task['title']}")
                    success = send_reminder_email(
                        to_email=to_email,
                        task_title=f"[{label} Reminder] {task['title']}",
                        task_description=task.get('description', '') or 'No details provided.',
                        deadline=task['deadline']
                    )
                    
                    # Mark reminder as sent
                    db_client.insert_reminder({
                        'task_id': task['id'],
                        'user_id': user_id,
                        'send_at': now.isoformat(),
                        'interval_type': label,
                        'status': 'sent' if success else 'failed'
                    })
    except Exception as e:
        logger.error(f"Error processing reminders: {e}")

# Initialize BackgroundScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(process_reminders, 'interval', minutes=1)

def start_worker():
    scheduler.start()
    logger.info("Background worker started.")

def shutdown_worker():
    scheduler.shutdown()
    logger.info("Background worker stopped.")
