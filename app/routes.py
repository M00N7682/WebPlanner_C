from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, date, timedelta
from sqlalchemy import and_, func, extract
from app import db
from app.models import Task
from app.forms import TaskForm

main = Blueprint('main', __name__)

@main.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
    
    # Get tasks statistics
    total_tasks = Task.query.filter_by(user_id=current_user.id).count()
    completed_tasks = Task.query.filter_by(user_id=current_user.id, status='completed').count()
    pending_tasks = total_tasks - completed_tasks
    
    # Get recent tasks
    recent_tasks = Task.query.filter_by(user_id=current_user.id)\
                           .order_by(Task.created_at.desc())\
                           .limit(5).all()
    
    # Get today's completed tasks for grass calendar
    today = date.today()
    today_completed = Task.query.filter_by(
        user_id=current_user.id, 
        status='completed'
    ).filter(
        func.date(Task.completed_at) == today
    ).count()
    
    return render_template('index.html', 
                         total_tasks=total_tasks,
                         completed_tasks=completed_tasks,
                         pending_tasks=pending_tasks,
                         recent_tasks=recent_tasks,
                         today_completed=today_completed)

@main.route('/tasks')
@login_required
def tasks():
    category = request.args.get('category', 'all')
    status = request.args.get('status', 'all')
    
    query = Task.query.filter_by(user_id=current_user.id)
    
    if category != 'all':
        query = query.filter_by(category=category)
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    
    return render_template('tasks.html', tasks=tasks, 
                         current_category=category, 
                         current_status=status)

@main.route('/add_task', methods=['GET', 'POST'])
@login_required
def add_task():
    form = TaskForm()
    if form.validate_on_submit():
        task = Task(
            title=form.title.data,
            description=form.description.data,
            category=form.category.data,
            priority=form.priority.data,
            due_date=form.due_date.data,
            user_id=current_user.id
        )
        db.session.add(task)
        db.session.commit()
        flash('작업이 추가되었습니다!', 'success')
        return redirect(url_for('main.tasks'))
    
    return render_template('add_task.html', form=form)

@main.route('/edit_task/<int:task_id>', methods=['GET', 'POST'])
@login_required
def edit_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    form = TaskForm(obj=task)
    
    if form.validate_on_submit():
        task.title = form.title.data
        task.description = form.description.data
        task.category = form.category.data
        task.priority = form.priority.data
        task.due_date = form.due_date.data
        task.updated_at = datetime.utcnow()
        db.session.commit()
        flash('작업이 수정되었습니다!', 'success')
        return redirect(url_for('main.tasks'))
    
    return render_template('edit_task.html', form=form, task=task)

@main.route('/toggle_task/<int:task_id>', methods=['POST'])
@login_required
def toggle_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    
    if task.status == 'completed':
        task.mark_pending()
    else:
        task.mark_completed()
    
    db.session.commit()
    return jsonify({'status': task.status, 'completed_at': task.completed_at})

@main.route('/delete_task/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    flash('작업이 삭제되었습니다!', 'success')
    return redirect(url_for('main.tasks'))

@main.route('/api/statistics')
@login_required
def statistics():
    """Get current statistics for dashboard"""
    total_tasks = Task.query.filter_by(user_id=current_user.id).count()
    completed_tasks = Task.query.filter_by(user_id=current_user.id, status='completed').count()
    pending_tasks = total_tasks - completed_tasks
    
    # Get today's completed tasks
    today = date.today()
    today_completed = Task.query.filter_by(
        user_id=current_user.id, 
        status='completed'
    ).filter(
        func.date(Task.completed_at) == today
    ).count()
    
    return jsonify({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'today_completed': today_completed
    })

@main.route('/api/recent_tasks')
@login_required
def recent_tasks():
    """Get recent tasks for dashboard"""
    recent_tasks = Task.query.filter_by(user_id=current_user.id)\
                           .order_by(Task.created_at.desc())\
                           .limit(5).all()
    
    tasks_data = []
    for task in recent_tasks:
        tasks_data.append({
            'id': task.id,
            'title': task.title,
            'category': task.category,
            'status': task.status,
            'created_at': task.created_at.strftime('%m/%d %H:%M')
        })
    
    return jsonify(tasks_data)

@main.route('/api/calendar_events')
@login_required
def calendar_events():
    """Get tasks as calendar events"""
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    query = Task.query.filter_by(user_id=current_user.id)
    
    # 날짜 범위 필터링 (선택사항)
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # 마감일이 있는 작업들 또는 생성일이 범위 내인 작업들
            query = query.filter(
                (Task.due_date.between(start, end)) |
                (func.date(Task.created_at).between(start, end))
            )
        except ValueError:
            pass  # 날짜 파싱 실패 시 필터링 없이 진행
    
    tasks = query.all()
    
    events = []
    for task in tasks:
        # 마감일이 있으면 마감일을, 없으면 생성일을 사용
        event_date = task.due_date.strftime('%Y-%m-%d') if task.due_date else task.created_at.strftime('%Y-%m-%d')
        
        events.append({
            'id': task.id,
            'title': task.title,
            'start': event_date,
            'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
            'created_at': task.created_at.strftime('%Y-%m-%d'),
            'category': task.category,
            'status': task.status,
            'priority': task.priority,
            'description': task.description
        })
    
    return jsonify(events)
