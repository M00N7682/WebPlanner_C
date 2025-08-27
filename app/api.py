from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user, login_required
from datetime import datetime, date, timedelta
from sqlalchemy import and_, func, extract
from app import db
from app.models import User, Task
import json

api = Blueprint('api', __name__)

# Authentication routes
@api.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '사용자명과 비밀번호를 입력해주세요.'}), 400
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return jsonify({
                'message': '로그인 성공',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }), 200
        else:
            return jsonify({'error': '사용자명 또는 비밀번호가 잘못되었습니다.'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': '모든 필드를 입력해주세요.'}), 400
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': '이미 존재하는 사용자명입니다.'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': '이미 존재하는 이메일입니다.'}), 400
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': '회원가입이 완료되었습니다!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': '로그아웃되었습니다.'}), 200

@api.route('/auth/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        }
    }), 200

# Task routes
@api.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    try:
        category = request.args.get('category', 'all')
        status = request.args.get('status', 'all')
        
        query = Task.query.filter_by(user_id=current_user.id)
        
        if category != 'all':
            query = query.filter_by(category=category)
        
        if status != 'all':
            query = query.filter_by(status=status)
        
        tasks = query.order_by(Task.created_at.desc()).all()
        
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'category': task.category,
                'priority': task.priority,
                'status': task.status,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'due_date': task.due_date.isoformat() if task.due_date else None
            })
        
        return jsonify({'tasks': tasks_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/tasks', methods=['POST'])
@login_required
def create_task():
    try:
        data = request.get_json()
        
        task = Task(
            title=data.get('title'),
            description=data.get('description', ''),
            category=data.get('category'),
            priority=data.get('priority', 'medium'),
            due_date=datetime.strptime(data.get('due_date'), '%Y-%m-%d').date() if data.get('due_date') else None,
            user_id=current_user.id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': '작업이 추가되었습니다!',
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'category': task.category,
                'priority': task.priority,
                'status': task.status,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'due_date': task.due_date.isoformat() if task.due_date else None
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if not task:
            return jsonify({'error': '작업을 찾을 수 없습니다.'}), 404
        
        data = request.get_json()
        
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.category = data.get('category', task.category)
        task.priority = data.get('priority', task.priority)
        task.due_date = datetime.strptime(data.get('due_date'), '%Y-%m-%d').date() if data.get('due_date') else task.due_date
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': '작업이 수정되었습니다!',
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'category': task.category,
                'priority': task.priority,
                'status': task.status,
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'due_date': task.due_date.isoformat() if task.due_date else None
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/tasks/<int:task_id>/toggle', methods=['POST'])
@login_required
def toggle_task(task_id):
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if not task:
            return jsonify({'error': '작업을 찾을 수 없습니다.'}), 404
        
        if task.status == 'completed':
            task.mark_pending()
        else:
            task.mark_completed()
        
        db.session.commit()
        
        return jsonify({
            'message': '작업 상태가 변경되었습니다.',
            'task': {
                'id': task.id,
                'status': task.status,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
        if not task:
            return jsonify({'error': '작업을 찾을 수 없습니다.'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': '작업이 삭제되었습니다!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Dashboard routes
@api.route('/dashboard/statistics', methods=['GET'])
@login_required
def get_statistics():
    try:
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
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/dashboard/recent-tasks', methods=['GET'])
@login_required
def get_recent_tasks():
    try:
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
        
        return jsonify({'tasks': tasks_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/calendar/events', methods=['GET'])
@login_required
def get_calendar_events():
    try:
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
        
        return jsonify({'events': events}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
