import json
import os
import random
import urllib.error
import urllib.parse
import urllib.request


def send_vk_message(text: str) -> None:
    token = os.environ.get('VK_ACCESS_TOKEN')
    if not token:
        print('VK_ERROR: token missing')
        return

    params = urllib.parse.urlencode({'access_token': token, 'v': '5.199'})
    with urllib.request.urlopen(f'https://api.vk.com/method/users.get?{params}', timeout=15) as r:
        me = json.loads(r.read())
    if 'error' in me:
        print(f'VK_ERROR users.get: {me["error"]}')
        return
    user_id = me['response'][0]['id']

    send_params = urllib.parse.urlencode({
        'access_token': token,
        'v': '5.199',
        'user_id': user_id,
        'random_id': random.randint(1, 2_000_000_000),
        'message': text,
    })
    with urllib.request.urlopen(f'https://api.vk.com/method/messages.send?{send_params}', timeout=15) as r:
        result = json.loads(r.read())
    if 'error' in result:
        print(f'VK_ERROR messages.send: {result["error"]}')


def handler(event: dict, context) -> dict:
    '''Отправляет на почту и в ВК выбранные девушкой дату, время и блюдо для свидания.'''
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

    if api_key and to_email:
        try:
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
        except urllib.error.HTTPError as e:
            print(f'RESEND_ERROR {e.code}: {e.read().decode()}')
        except Exception as e:
            print(f'RESEND_ERROR: {e}')
    else:
        print(f'RESEND_SKIPPED: api_key={bool(api_key)} to_email={bool(to_email)}')

    try:
        send_vk_message(
            f'Она согласилась на свидание! 💕\nДата: {date}\nВремя: {time}\nЧто будем кушать: {food}'
        )
    except Exception as e:
        print(f'VK_ERROR: {e}')

    return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}