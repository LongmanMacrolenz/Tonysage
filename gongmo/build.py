"""page.html에 contests.json을 넣어 페이지를 만든다.

    python3 gongmo/build.py                  # gongmo/index.html (브라우저로 바로 여는 판)
    python3 gongmo/build.py --artifact OUT   # Claude 아티팩트로 게시할 판(문서 뼈대 없음)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def page_with_data():
    page = open(os.path.join(HERE, 'page.html'), encoding='utf-8').read()
    data = json.load(open(os.path.join(HERE, 'contests.json'), encoding='utf-8'))
    snap = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    assert page.count('__SNAPSHOT__') == 1
    return page.replace('__SNAPSHOT__', snap)


def main():
    body = page_with_data()
    if len(sys.argv) == 3 and sys.argv[1] == '--artifact':
        out = sys.argv[2]
        open(out, 'w', encoding='utf-8').write(body)
    else:
        out = os.path.join(HERE, 'index.html')
        doc = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
               '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
               '</head>\n<body>\n' + body + '</body>\n</html>\n')
        open(out, 'w', encoding='utf-8').write(doc)
    print(out, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
