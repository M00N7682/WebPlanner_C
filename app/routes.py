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

@main.route('/api/grass_data')
@login_required
def grass_data():
    """GitHub-like grass calendar data"""
    # Get data for the past year
    end_date = date.today()
    start_date = end_date - timedelta(days=365)
    
    # Query completed tasks grouped by date
    completed_tasks = db.session.query(
        func.date(Task.completed_at).label('date'),
        func.count(Task.id).label('count')
    ).filter(
        and_(
            Task.user_id == current_user.id,
            Task.status == 'completed',
            func.date(Task.completed_at) >= start_date,
            func.date(Task.completed_at) <= end_date
        )
    ).group_by(func.date(Task.completed_at)).all()
    
    # Convert to dictionary
    data = {}
    for task_date, count in completed_tasks:
        data[task_date.strftime('%Y-%m-%d')] = count
    
    return jsonify(data)

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
