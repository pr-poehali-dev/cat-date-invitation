import json
import os
import urllib.request


def handler(event: dict, context) -> dict:
    '''Отправляет на почту выбранные девушкой дату, время и блюдо для свидания.'''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if method != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    date = body.get('date', '—')
    time = body.get('time', '—')
    food = body.get('food', '—')

    api_key = os.environ.get('RESEND_API_KEY')
    to_email = os.environ.get('DATE_NOTIFY_EMAIL')

    if not api_key or not to_email:
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'Email not configured'})}

    html = (
        '<div style="font-family:sans-serif;padding:24px;background:#fff0f5;border-radius:16px">'
        '<h2 style="color:#e5679a">Она сказала ДА! 💕</h2>'
        f'<p style="font-size:18px"><b>Дата:</b> {date}</p>'
        f'<p style="font-size:18px"><b>Время:</b> {time}</p>'
        f'<p style="font-size:18px"><b>Что будем кушать:</b> {food}</p>'
        '</div>'
    )

    payload = json.dumps({
        'from': 'onboarding@resend.dev',
        'to': [to_email],
        'subject': 'Она согласилась на свидание! 💘',
        'html': html,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        method='POST',
    )
    urllib.request.urlopen(req, timeout=25)

    return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}
