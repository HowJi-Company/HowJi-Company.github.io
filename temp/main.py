import requests
from bs4 import BeautifulSoup
import os

# 設定目標網站URL
base_url = 'https://ihealth.vghtc.gov.tw'

# 發送HTTP請求獲取網頁內容
response = requests.get(base_url)
soup = BeautifulSoup(response.text, 'html.parser')

# 尋找所有a標籤並檢查是否包含具有onmouseover屬性的img標籤
links = [a for a in soup.find_all('a') if a.find('img', onmouseover=True)]

# 處理每個含onmouseover的連結
for link in links:
    sub_url = base_url + link['href']
    print("訪問頁面：", sub_url)  
    sub_response = requests.get(sub_url)
    sub_soup = BeautifulSoup(sub_response.text, 'html.parser')

    # 尋找特定ID的table
    table = sub_soup.find('table', {'class': 'table custom table-hover', 'id': 'kmtbl'})
    if table:
        table_links = table.find_all('a')
        for table_link in table_links:
            content_url = base_url + table_link['href']
            content_response = requests.get(content_url)
            content_soup = BeautifulSoup(content_response.text, 'html.parser')
            
            normal_article_title_div = content_soup.find('div', {'class': 'title pull-left'})
            # 檢查網頁內容是否有影片 做相對應的處理
            if normal_article_title_div:
                # 內文無影片
                # 替換斜線並形成文件名
                file_name = normal_article_title_div.text.strip().replace('/', ' or ') + '.txt'
                # 尋找特定ID的內容div
                content_div = content_soup.find('div', {'id': 'fs-media-content'})
                if content_div:
                    content_text = content_div.text.strip()
                    # 移除“送出答案”及其後的內容
                    if '送出答案' in content_text:
                        content_text = content_text.split('送出答案')[0].strip()

                    os.makedirs('documents', exist_ok=True)
                    file_path = os.path.join('documents', file_name)
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(content_text)
                        print(f'文件已儲存: {file_path}')
            else:
                # 內文有影片
                media_article_title_div = content_soup.find('div', {'class': 'title text-overflow'})
                # 替換斜線並形成文件名
                file_name = media_article_title_div.text.strip().replace('/', ' or ') + '.txt'
                content_div = content_soup.find('div', {'id': 'media-intro'})
                if content_div:
                    content_text = content_div.text.strip()
                    # 移除“送出答案”及其後的內容
                    if '送出答案' in content_text:
                        content_text = content_text.split('送出答案')[0].strip()

                    os.makedirs('documents', exist_ok=True)
                    file_path = os.path.join('documents', file_name)
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(content_text)
                        print(f'文件已儲存: {file_path}')

print('爬蟲任務完成。')
