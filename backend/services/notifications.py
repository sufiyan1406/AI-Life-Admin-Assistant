import emails
from emails.template import JinjaTemplate
from config import settings

def send_reminder_email(to_email: str, task_title: str, task_description: str, deadline: str):
    """Send an email reminder using Gmail SMTP."""
    
    html_template = """
    <h2>Life Admin Reminder</h2>
    <p><strong>Task:</strong> {{ task_title }}</p>
    <p><strong>Deadline:</strong> {{ deadline }}</p>
    <p><strong>Details:</strong> {{ task_description }}</p>
    <br>
    <p>Log in to your dashboard to mark this as complete!</p>
    """
    
    message = emails.html(
        html=JinjaTemplate(html_template),
        subject=f"Reminder: {task_title}",
        mail_from=('AI Life Admin', settings.EMAIL_HOST_USER)
    )
    
    response = message.send(
        to=to_email,
        smtp={
            'host': settings.EMAIL_HOST,
            'port': settings.EMAIL_PORT,
            'tls': True,
            'user': settings.EMAIL_HOST_USER,
            'password': settings.EMAIL_HOST_PASSWORD,
        }
    )
    
    return response.status_code == 250
