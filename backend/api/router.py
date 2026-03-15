from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
from datetime import datetime
from models import TaskExtraction, TaskCreate, TaskResponse
from services.db import db_client
from services.ai_pipeline import process_file_and_extract_task
import uuid

from services.auth import get_current_user_id
import uuid

router = APIRouter(prefix="/api/v1", tags=["tasks"])

@router.post("/tasks/upload", response_model=TaskResponse)
async def upload_file_and_extract(
    file: UploadFile = File(...), 
    user_id: str = Depends(get_current_user_id)
):
    """Upload a file (image, pdf, audio), extract text via AI, and save the task."""
    try:
        content = await file.read()
        
        # 1. AI Extraction Pipeline
        extraction: TaskExtraction = process_file_and_extract_task(
            file_bytes=content,
            filename=file.filename,
            content_type=file.content_type
        )
        
        # 2. Map to Database Model
        task_data = {
            "user_id": user_id,
            "title": extraction.task_title,
            "category": extraction.category,
            "deadline": extraction.deadline.isoformat() if extraction.deadline else None,
            "priority": extraction.priority,
            "description": extraction.description,
            "confidence": extraction.confidence,
            "status": "pending"
        }
        
        # 3. Save to Supabase
        data = db_client.insert_task(task_data)
        
        if not data or len(data) == 0:
            raise HTTPException(status_code=500, detail="Failed to save task to database")
            
        return data[0]
        
    except Exception as e:
        print(f"Error in upload_file_and_extract: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(
    category: Optional[str] = None, 
    user_id: str = Depends(get_current_user_id)
):
    """Fetch all tasks for the current user."""
    try:
        data = db_client.get_all_tasks(user_id=user_id, category=category)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str, 
    task: TaskCreate, 
    user_id: str = Depends(get_current_user_id)
):
    """Update an existing task owned by current user."""
    try:
        data = db_client.update_task(task_id, user_id, task.dict(exclude_unset=True))
        if not data or len(data) == 0:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        return data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """Delete a task owned by current user."""
    try:
        db_client.delete_task(task_id, user_id)
        return {"status": "success", "message": "Task deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """Mark a task as completed for current user."""
    try:
        data = db_client.complete_task(task_id, user_id)
        if not data or len(data) == 0:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        return data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
