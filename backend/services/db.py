import requests
import urllib.parse
from config import settings

class SupabaseRESTClient:
    """A lightweight synchronous HTTP client for the Supabase REST API."""
    def __init__(self):
        self.url = settings.SUPABASE_URL.rstrip('/')
        self.headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def insert_task(self, task_data):
        res = requests.post(f"{self.url}/rest/v1/tasks", headers=self.headers, json=task_data)
        if not res.ok:
            print(f"Supabase Insert Error: {res.text}")
        res.raise_for_status()
        return res.json()
        
    def get_all_tasks(self, user_id: str, category: str = None):
        url = f"{self.url}/rest/v1/tasks?user_id=eq.{user_id}&select=*&order=created_at.desc"
        if category:
            url += f"&category=eq.{category}"
        res = requests.get(url, headers=self.headers)
        if not res.ok:
            print(f"Supabase Get Tasks Error: {res.text}")
        res.raise_for_status()
        return res.json()
        
    def complete_task(self, task_id: str, user_id: str):
        res = requests.patch(f"{self.url}/rest/v1/tasks?id=eq.{task_id}&user_id=eq.{user_id}", headers=self.headers, json={"status": "completed"})
        if not res.ok:
            print(f"Supabase Complete Task Error: {res.text}")
        res.raise_for_status()
        return res.json()
 
    def update_task(self, task_id: str, user_id: str, update_data: dict):
        res = requests.patch(f"{self.url}/rest/v1/tasks?id=eq.{task_id}&user_id=eq.{user_id}", headers=self.headers, json=update_data)
        if not res.ok:
            print(f"Supabase Update Task Error: {res.text}")
        res.raise_for_status()
        return res.json()
 
    def delete_task(self, task_id: str, user_id: str):
        res = requests.delete(f"{self.url}/rest/v1/tasks?id=eq.{task_id}&user_id=eq.{user_id}", headers=self.headers)
        if not res.ok:
            print(f"Supabase Delete Task Error: {res.text}")
        res.raise_for_status()
        return res.json()
        
    def get_pending_tasks_with_deadlines(self):
        # This is for the background worker, which needs all users' tasks
        url = f"{self.url}/rest/v1/tasks?status=eq.pending&deadline=not.is.null&select=*"
        res = requests.get(url, headers=self.headers)
        if not res.ok:
            print(f"Supabase Tasks with Deadlines Error: {res.text}")
        res.raise_for_status()
        return res.json()
        
    def check_reminder_sent(self, task_id, interval_type):
        res = requests.get(f"{self.url}/rest/v1/reminders?task_id=eq.{task_id}&interval_type=eq.{interval_type}&status=eq.sent&select=*", headers=self.headers)
        res.raise_for_status()
        return res.json()
        
    def insert_reminder(self, reminder_data):
        res = requests.post(f"{self.url}/rest/v1/reminders", headers=self.headers, json=reminder_data)
        if not res.ok:
            print(f"Supabase Reminder Error: {res.text}")
        res.raise_for_status()
        return res.json()

    def get_user_profile(self, user_id: str):
        res = requests.get(f"{self.url}/rest/v1/profiles?id=eq.{user_id}&select=*", headers=self.headers)
        if not res.ok:
            return None
        data = res.json()
        return data[0] if data else None

db_client = SupabaseRESTClient()
