from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TaskExtraction(BaseModel):
    task_title: str = Field(description="The title or brief summary of the task")
    category: str = Field(description="Bills, Study, Appointments, Subscriptions, Personal, Work")
    deadline: Optional[datetime] = Field(None, description="The deadline for the task, if found in the text. Must be an ISO-8601 string or null.")
    priority: str = Field(description="Priority of the task: 'low', 'medium', or 'high'", pattern="^(low|medium|high)$")
    description: Optional[str] = Field(None, description="Any additional details or context needed for the task")
    confidence: float = Field(description="AI confidence score between 0.0 and 1.0")

class TaskCreate(BaseModel):
    title: str
    category: str = "Personal"
    deadline: Optional[datetime] = None
    priority: str = "medium"
    description: Optional[str] = None
    status: str = "pending"
    confidence: float = 1.0

class TaskResponse(TaskCreate):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
class ReminderCreate(BaseModel):
    task_id: str
    send_at: datetime

class ReminderResponse(ReminderCreate):
    id: str
    status: str
    created_at: datetime
