from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, DateField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo

class TaskForm(FlaskForm):
    title = StringField('제목', validators=[DataRequired(), Length(min=1, max=200)])
    description = TextAreaField('설명')
    category = SelectField('카테고리', 
                         choices=[('회사일', '회사일'), ('사이드프로젝트', '사이드프로젝트'), ('공부', '공부')],
                         validators=[DataRequired()])
    priority = SelectField('우선순위',
                         choices=[('low', '낮음'), ('medium', '보통'), ('high', '높음')],
                         default='medium')
    due_date = DateField('마감일', format='%Y-%m-%d')
    submit = SubmitField('저장')

class LoginForm(FlaskForm):
    username = StringField('사용자명', validators=[DataRequired(), Length(min=4, max=80)])
    password = PasswordField('비밀번호', validators=[DataRequired()])
    submit = SubmitField('로그인')

class RegisterForm(FlaskForm):
    username = StringField('사용자명', validators=[DataRequired(), Length(min=4, max=80)])
    email = StringField('이메일', validators=[DataRequired(), Email()])
    password = PasswordField('비밀번호', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('비밀번호 확인', 
                            validators=[DataRequired(), EqualTo('password', message='비밀번호가 일치하지 않습니다.')])
    submit = SubmitField('회원가입')
