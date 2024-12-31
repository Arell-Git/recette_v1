import browser_cookie3
from bs4 import BeautifulSoup
import json
import os
import pandas as pd
import re
import requests
import sys

global cookies
cookies = dict()

url_regex = '(?<=\.com/)(.+?)(?=\?|$)'
video_id_regex = '(?<=/video/)([0-9]+)'

ms_token = os.environ.get(
    "ms_token", None
)

headers = {'Accept-Encoding': 'gzip, deflate, sdch',
           'Accept-Language': 'en-US,en;q=0.8',
           'Upgrade-Insecure-Requests': '1',
           'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
           'Cache-Control': 'max-age=0',
           'Connection': 'keep-alive'}
context_dict = {'viewport': {'width': 0,
                             'height': 0},
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'}

runsb_rec = ('If pyktok does not operate as expected, you may find it helpful to run the \'specify_browser\' function. \'specify_browser\' takes as its sole argument a string representing a browser installed on your system, e.g. "chrome," "firefox," "edge," etc.')
runsb_err = 'No browser defined for cookie extraction. We strongly recommend you run \'specify_browser\', which takes as its sole argument a string representing a browser installed on your system, e.g. "chrome," "firefox," "edge," etc.'

#print(runsb_rec) 

class BrowserNotSpecifiedError(Exception):
    def __init__(self):
        super().__init__(runsb_err)

def specify_browser(browser):
    global cookies
    cookies = getattr(browser_cookie3,browser)(domain_name='www.tiktok.com')

def deduplicate_metadata(metadata_fn,video_df,dedup_field='video_id'):
    if os.path.exists(metadata_fn):
        metadata = pd.read_csv(metadata_fn,keep_default_na=False)
        combined_data = pd.concat([metadata,video_df])
        combined_data[dedup_field] = combined_data[dedup_field].astype(str)
    else:
        combined_data = video_df
    return combined_data.drop_duplicates(dedup_field)




#currently unused, but leaving it in case it's needed later
'''
def fix_tt_url(tt_url):
    if 'www.' not in tt_url.lower():
        url_parts = tt_url.split('://')
        fixed_url = url_parts[0] + '://www.' + url_parts[1]
        return fixed_url
    else:
        return tt_url
'''
def get_tiktok_json(video_url,browser_name=None):
    if 'cookies' not in globals() and browser_name is None:
        raise BrowserNotSpecifiedError
    global cookies
    if browser_name is not None:
        cookies = getattr(browser_cookie3,browser_name)(domain_name='www.tiktok.com')
    tt = requests.get(video_url,
                      headers=headers,
                      cookies=cookies,
                      timeout=20)
    # retain any new cookies that got set in this request
    cookies = tt.cookies
    soup = BeautifulSoup(tt.text, "html.parser")
    tt_script = soup.find('script', attrs={'id':"SIGI_STATE"})
    try:
        tt_json = json.loads(tt_script.string)
    except AttributeError:
        return
    return tt_json

def alt_get_tiktok_json(video_url,browser_name=None):
    if 'cookies' not in globals() and browser_name is None:
        raise BrowserNotSpecifiedError
    global cookies
    if browser_name is not None:
        cookies = getattr(browser_cookie3,browser_name)(domain_name='www.tiktok.com')
    tt = requests.get(video_url, 
                      headers=headers,
                      cookies=cookies,
                      timeout=20)
    # retain any new cookies that got set in this request
    cookies = tt.cookies
    soup = BeautifulSoup(tt.text, "html.parser")
    tt_script = soup.find('script', attrs={'id':"__UNIVERSAL_DATA_FOR_REHYDRATION__"})
    try:
        tt_json = json.loads(tt_script.string)
    except AttributeError:
        print("The function encountered a downstream error and did not deliver any data, which happens periodically for various reasons. Please try again later.")
        return
    return tt_json

def save_tiktok(video_url,
                save_video=True,
                metadata_fn='',
                browser_name=None,
                return_fns=False):
    if 'cookies' not in globals() and browser_name is None:
        raise BrowserNotSpecifiedError
    if save_video == False and metadata_fn == '':
        print('Since save_video and metadata_fn are both False/blank, the program did nothing.')
        return
    
    try:
        tt_json = alt_get_tiktok_json(video_url, browser_name)
        if not tt_json:
            raise ValueError("Failed to retrieve TikTok JSON data. The video URL might be invalid or blocked.")
        
        if save_video:
            regex_url = re.findall(url_regex, video_url)
            if not regex_url:
                raise ValueError("Invalid TikTok URL format.")
            
            video_fn = regex_url[0].replace('/', '_') + '.mp4'
            try:
                tt_video_url = tt_json["__DEFAULT_SCOPE__"]['webapp.video-detail']['itemInfo']['itemStruct']['video']['playAddr']
                if tt_video_url == '':
                    tt_video_url = tt_json["__DEFAULT_SCOPE__"]['webapp.video-detail']['itemInfo']['itemStruct']['video']['downloadAddr']
            except KeyError:
                raise KeyError("Could not extract video URL from TikTok JSON data.")

            headers['referer'] = 'https://www.tiktok.com/'
            tt_video = requests.get(tt_video_url, allow_redirects=True, headers=headers, cookies=cookies, timeout=20)

            if tt_video.status_code != 200:
                raise Exception(f"Failed to download video. Status code: {tt_video.status_code}")

            # Prepare the data to send to the API
            files = {'file': (video_fn, tt_video.content, 'video/mp4')}
            response = requests.post('http://localhost:5000/api/upload', files=files)

            if response.status_code == 200:
                print(response.text)
            else:
                raise Exception(f"Failed to upload video. Status code: {response.status_code}, Response: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
    except ValueError as ve:
        print(f"Value error: {ve}")
    except KeyError as ke:
        print(f"Key error: {ke}")
    except Exception as e:
        # Return JSON error response
        error_message = {"error": str(e)}
        print(json.dumps(error_message))
        sys.exit(1) 
        
        

        
       
        
save_tiktok(sys.argv[1], True)

