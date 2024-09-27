from flask import Flask, request, jsonify, redirect, url_for, session, make_response
from flask_cors import CORS, cross_origin
from bs4 import BeautifulSoup
import requests
import anthropic
import json
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import random
import os
import traceback
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from authlib.integrations.flask_client import OAuth
from functools import wraps
import time
from bs4 import BeautifulSoup
import traceback
import requests
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://instagraphix.pro", "https://www.instagraphix.pro", "https://be-194431053746.us-central1.run.app"]}}, supports_credentials=True)
app.secret_key = os.getenv('FLASK_SECRET_KEY')
oauth = OAuth(app)


# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# Google OAuth configuration
google = oauth.register(
    name='google',
    client_id='194431053746-ouf0f33qmfq29dv1qku6e42huu4lr038.apps.googleusercontent.com',
    client_secret='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',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
    jwks_uri = "https://www.googleapis.com/oauth2/v3/certs"
)



SCRAPING_ROBOT_API_URL = 'https://api.scrapingrobot.com/'
API_TOKEN = os.getenv('SCRAPING_ROBOT_API_TOKEN')

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

LEMON_SQUEEZY_API_KEY = os.getenv('LEMON_SQUEEZY_API_KEY')
LEMON_SQUEEZY_STORE_ID = os.getenv('LEMON_SQUEEZY_STORE_ID')

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    google_id = db.Column(db.String(128), unique=True, nullable=True)
    credits = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Infographic model
class Infographic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            user = User.query.filter_by(id=token).first()
            if not user:
                raise ValueError('Invalid token')
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(user, *args, **kwargs)
    return decorated



class InfographicGenerator:
    def __init__(self, templates_dir='templates'):
        self.templates_dir = templates_dir
        self.templates = self.load_template_configs()
        self.fonts = self.load_fonts()

    def load_template_configs(self):
        templates = {3: [], 4: [], 5: []}
        try:
            for filename in os.listdir(self.templates_dir):
                if filename.endswith('_config.json'):
                    with open(os.path.join(self.templates_dir, filename), 'r') as f:
                        config = json.load(f)
                        section_count = len(config.get('elements', {}).get('sections', []))
                        if section_count in templates:
                            config['filename'] = filename  # Store filename in config
                            templates[section_count].append(config)
            print("Loaded templates:", json.dumps(templates, indent=2))
        except Exception as e:
            print(f"Error loading template configs: {str(e)}")
            traceback.print_exc()
        return templates

    def load_fonts(self):
        fonts = {}
        try:
            fonts_dir = os.path.join(self.templates_dir, 'fonts')
            for font_file in os.listdir(fonts_dir):
                if font_file.endswith('.ttf'):
                    font_name = os.path.splitext(font_file)[0].lower()
                    font_path = os.path.join(fonts_dir, font_file)
                    fonts[font_name] = font_path
            print("Loaded fonts:", fonts)
        except Exception as e:
            print(f"Error loading fonts: {str(e)}")
            traceback.print_exc()
        return fonts

    def get_template_configs(self, section_count):
        if section_count not in self.templates or not self.templates[section_count]:
            raise ValueError(f"No templates available for {section_count} sections")
        return self.templates[section_count]

    def create_infographics(self, content, template_config=None, customizations=None):
        try:
            section_count = len(content['sections'])
            if section_count not in [3, 4, 5]:
                raise ValueError("Number of sections must be 3, 4, or 5")

            if template_config:
                template_configs = [template_config]
            else:
                template_configs = self.get_template_configs(section_count)

            results = []

            for config in template_configs:
                with Image.open(os.path.join(self.templates_dir, config['image'])) as base_img:
                    print(f"Template image loaded successfully. Size: {base_img.size}")
                    
                    scale_factor = 2
                    new_size = (base_img.width * scale_factor, base_img.height * scale_factor)
                    
                    base_img_resized = base_img.resize(new_size, Image.LANCZOS)
                    
                    img = Image.new('RGBA', new_size, (255, 255, 255, 0))
                    
                    img.paste(base_img_resized, (0, 0), base_img_resized)
                    
                    if customizations and 'backgroundColor' in customizations:
                        color_layer = Image.new('RGBA', new_size, customizations['backgroundColor'])
                        img = Image.alpha_composite(img, color_layer)
                    
                    draw = ImageDraw.Draw(img)
                    
                    fonts = self.prepare_fonts(config, customizations, scale_factor)
                    
                    self.draw_text(draw, content['title'], config['elements']['title'], fonts['title'], scale_factor)
                    
                    for i, section in enumerate(content['sections']):
                        if i < len(config['elements']['sections']):
                            section_config = config['elements']['sections'][i]
                            self.draw_text(draw, section['title'], section_config['section'], fonts['subtitle'], scale_factor)
                            
                            paragraph = section['points'][0] if section['points'] else ""
                            self.draw_text(draw, paragraph, section_config['content'], fonts['body'], scale_factor)
                        else:
                            print(f"Warning: More sections in content than in template config. Skipping section {i+1}")

                    img = img.resize((base_img.width, base_img.height), Image.LANCZOS)

                    output_dir = 'generated_infographics'
                    os.makedirs(output_dir, exist_ok=True)
                    local_filename = f"{output_dir}/infographic_{config['filename'].replace('_config.json', '')}.png"
                    img.save(local_filename)
                    print(f"Infographic saved locally as: {local_filename}")

                    buffer = io.BytesIO()
                    img.save(buffer, format="PNG")
                    img_str = base64.b64encode(buffer.getvalue()).decode()
                    
                    results.append({
                        'base64_image': f"data:image/png;base64,{img_str}",
                        'local_path': local_filename,
                        'template_name': config['filename'].replace('_config.json', '')
                    })

            return results

        except Exception as e:
            print(f"Error creating infographics: {str(e)}")
            traceback.print_exc()
            raise

    def prepare_fonts(self, template_config, customizations, scale_factor):
        fonts = {}
        try:
            if 'fonts' in template_config:
                for key, (default_font, default_size) in template_config['fonts'].items():
                    font_family = customizations.get(key, {}).get('family', default_font) if customizations else default_font
                    font_file = self.fonts.get(font_family.lower(), None)
                    if font_file:
                        size = customizations.get(key, {}).get('size', default_size) if customizations else default_size
                        adjusted_size = int(size * scale_factor * 1.5)
                        fonts[key] = ImageFont.truetype(font_file, adjusted_size)
                    else:
                        print(f"Warning: Font '{font_family}' not found, using default font.")
                        fonts[key] = ImageFont.load_default()
            else:
                print("Warning: Template config does not have a valid 'fonts' configuration.")
                fonts['body'] = ImageFont.load_default()

            if 'title' not in fonts:
                fonts['title'] = ImageFont.load_default()
        except Exception as e:
            print(f"Error preparing fonts: {str(e)}")
            traceback.print_exc()
        return fonts
    
    def draw_text(self, draw, text, element_config, font, scale_factor):
        try:
            x = int(element_config['x'] * scale_factor)
            y = int(element_config['y'] * scale_factor)
            width = int(element_config['width'] * scale_factor)
            height = int(element_config['height'] * scale_factor)
            color = element_config.get('color', '#000000')
            anchor = element_config.get('anchor', 'lt')
            rotation = element_config.get('rotate', 0)

            words = text.split()
            lines = []
            current_line = []
            for word in words:
                test_line = ' '.join(current_line + [word])
                if font.getlength(test_line) <= width:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            lines.append(' '.join(current_line))

            y_offset = 0
            for line in lines:
                bbox = font.getbbox(line)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                if anchor == 'middle':
                    text_x = x + (width - text_width) // 2
                elif anchor == 'left':
                    text_x = x
                else:
                    text_x = x

                if y_offset + text_height > height:
                    break

                if rotation != 0:
                    txt_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
                    txt_draw = ImageDraw.Draw(txt_img)
                    txt_draw.text((0, 0), line, font=font, fill=color)
                    rotated_txt = txt_img.rotate(rotation, expand=1, resample=Image.BICUBIC)
                    img = draw._image
                    img.paste(rotated_txt, (text_x, y + y_offset), rotated_txt)
                else:
                    draw.text((text_x, y + y_offset), line, font=font, fill=color)

                y_offset += text_height + (text_height // 4)

        except Exception as e:
            print(f"Error drawing text: {str(e)}")
            traceback.print_exc()

def extract_title(soup):
    title_candidates = [
        soup.find('h1'),
        soup.find('meta', attrs={'property': 'og:title'}),
        soup.find('meta', attrs={'property': 'twitter:title'}),
        next((meta for meta in soup.find_all('meta', attrs={'name': 'title'})), None),
        soup.find('title')
    ]
    
    for candidate in title_candidates:
        if candidate:
            if candidate.name in ['h1', 'title']:
                return candidate.text.strip()
            elif candidate.get('content'):
                return candidate['content'].strip()
    
    return "Title not found"

def scrape_text(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = extract_title(soup)
        
        content = []
        main_content = soup.find(['article', 'main', 'div', 'section'])
        if main_content:
            for elem in main_content.find_all(['p', 'h2', 'h3', 'ul', 'ol']):
                if elem.name in ['h2', 'h3']:
                    content.append({'type': 'heading', 'text': elem.text.strip()})
                elif elem.name == 'p':
                    if len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                elif elem.name in ['ul', 'ol']:
                    list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                    if list_items:
                        content.append({'type': 'list', 'items': list_items})

        if not content:
            body = soup.find('body')
            if body:
                for elem in body.find_all(['p', 'h2', 'h3', 'h4', 'ul', 'ol']):
                    if elem.name in ['h2', 'h3', 'h4']:
                        content.append({'type': 'heading', 'text': elem.text.strip()})
                    elif elem.name == 'p' and len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                    elif elem.name in ['ul', 'ol']:
                        list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                        if list_items:
                            content.append({'type': 'list', 'items': list_items})                

        while content and content[0]['type'] != 'heading' and len(content[0].get('text', '')) < 50:
            content.pop(0)
        
        return {
            'title': title,
            'content': content
        }
    except requests.RequestException as e:
        print(f"Error scraping {url}: {str(e)}")
        return None
    
def parse_html_content(html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        title = extract_title(soup)
        
        content = []
        main_content = soup.find(['article', 'main', 'div', 'section'])
        if main_content:
            for elem in main_content.find_all(['p', 'h2', 'h3', 'ul', 'ol']):
                if elem.name in ['h2', 'h3']:
                    content.append({'type': 'heading', 'text': elem.text.strip()})
                elif elem.name == 'p':
                    if len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                elif elem.name in ['ul', 'ol']:
                    list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                    if list_items:
                        content.append({'type': 'list', 'items': list_items})

        if not content:
            body = soup.find('body')
            if body:
                for elem in body.find_all(['p', 'h2', 'h3', 'h4', 'ul', 'ol']):
                    if elem.name in ['h2', 'h3', 'h4']:
                        content.append({'type': 'heading', 'text': elem.text.strip()})
                    elif elem.name == 'p' and len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                    elif elem.name in ['ul', 'ol']:
                        list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                        if list_items:
                            content.append({'type': 'list', 'items': list_items})                

        while content and content[0]['type'] != 'heading' and len(content[0].get('text', '')) < 50:
            content.pop(0)
        
        return {
            'title': title,
            'content': content
        }
    except Exception as e:
        print(f"Error parsing HTML content: {str(e)}")
        traceback.print_exc()
        raise

def process_content_with_claude(parsed_content):
    try:
        if not parsed_content:
            raise ValueError("Parsed content is empty or None")

        title = parsed_content.get('title', 'Untitled')
        content = parsed_content.get('content', [])

        if not content:
            raise ValueError("No content found in parsed data")
        
        print(parsed_content)

        prompt = f"""Based on the following content, create an informative structure for an infographic about {title}, the title should be STRICTLY less than 3 words if longer.
The structure should include:
1. A brief introduction (2-3 sentences)
2. Between 3 to 5 main sections depending on the content, each with:
   - A clear, concise title less than 2 words
   - A very short paragraph (2-3 sentences) explaining the section

IMPORTANT: 
        2. 
        3. The title should be less than 3 words if longer.

        
IMPORTANT GUIDELINES:
- Ensure that you preserve the original context and meaning of the scraped text. Do not alter or misrepresent the information provided.
- Structure the content, concise it but don't change its meaning or intent.
- Use a first-person perspective ("I") instead of referring to "the author" or "the writer".
- Avoid phrases like "this section," "we will explore," or any text that implies a longer written piece.
- The title should be less than 3 words if longer.

Content:
{content}

Please format your response as a JSON structure with the following format:
{{
    "title": "Main title of the infographic",
    "introduction": "Brief introduction text",
    "sections": [
        {{
            "title": "Section 1 Title",
            "points": ["A very short paragraph (2-3 sentences) explaining this section."]
        }},
        // More sections...
    ]
}}

Important: The number of sections should be 3,4 or 5 based on the most appropriate division of the content."""

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        content = message.content[0].text if isinstance(message.content, list) else message.content

        infographic_data = json.loads(content)
        
        if len(infographic_data['sections']) not in [3, 4, 5]:
            raise ValueError(f"Invalid number of sections: {len(infographic_data['sections'])}. Must be 3, 4, or 5.")

        return infographic_data
    except json.JSONDecodeError:
        print("Error: Failed to parse JSON from Claude's response")
        return {"error": "Failed to parse JSON", "raw_content": content}
    except ValueError as ve:
        print(f"Error: {str(ve)}")
        return {"error": str(ve), "raw_content": content}
    except Exception as e:
        print(f"Error processing content with Claude: {str(e)}")
        traceback.print_exc()
        return {"error": f"Unexpected error: {str(e)}", "traceback": traceback.format_exc()}

generator = InfographicGenerator()

def extract_title(soup):
    title_candidates = [
        soup.find('h1'),
        soup.find('meta', attrs={'property': 'og:title'}),
        soup.find('meta', attrs={'property': 'twitter:title'}),
        next((meta for meta in soup.find_all('meta', attrs={'name': 'title'})), None),
        soup.find('title')
    ]
    
    for candidate in title_candidates:
        if candidate:
            if candidate.name in ['h1', 'title']:
                return candidate.text.strip()
            elif candidate.get('content'):
                return candidate['content'].strip()
    
    return "Title not found"


def scrape_text(url):
    try:
        app.logger.info(f"Starting to scrape URL: {url}")
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = extract_title(soup)
        
        content = []
        main_content = soup.find(['article', 'main', 'div', 'section'])
        if main_content:
            for elem in main_content.find_all(['p', 'h2', 'h3', 'ul', 'ol']):
                if elem.name in ['h2', 'h3']:
                    content.append({'type': 'heading', 'text': elem.text.strip()})
                elif elem.name == 'p':
                    if len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                elif elem.name in ['ul', 'ol']:
                    list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                    if list_items:
                        content.append({'type': 'list', 'items': list_items})

        if not content:
            body = soup.find('body')
            if body:
                for elem in body.find_all(['p', 'h2', 'h3', 'h4', 'ul', 'ol']):
                    if elem.name in ['h2', 'h3', 'h4']:
                        content.append({'type': 'heading', 'text': elem.text.strip()})
                    elif elem.name == 'p' and len(elem.text.strip()) > 20:
                        content.append({'type': 'paragraph', 'text': elem.text.strip()})
                    elif elem.name in ['ul', 'ol']:
                        list_items = [li.text.strip() for li in elem.find_all('li') if len(li.text.strip()) > 5]
                        if list_items:
                            content.append({'type': 'list', 'items': list_items})                

        while content and content[0]['type'] != 'heading' and len(content[0].get('text', '')) < 50:
            content.pop(0)
        
        result = {
            'title': title,
            'content': content
        }
        
        app.logger.info(f"Scraping completed. Result: {result}")
        return result
    
    except requests.RequestException as e:
        app.logger.error(f"Error during scraping: {str(e)}")
        app.logger.error(traceback.format_exc())
        return None
    except Exception as e:
        app.logger.error(f"Unexpected error during scraping: {str(e)}")
        app.logger.error(traceback.format_exc())
        return None

@app.route('/api/user')
def get_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({
            'username': user.username,
            'email': user.email,
            'credits': user.credits
        })
    return jsonify({'error': 'Not logged in'}), 401
    

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        return jsonify({'token': str(user.id), 'credits': user.credits}), 200
    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/credits', methods=['GET'])
@token_required
def get_credits(user):
    return jsonify({'credits': user.credits})


@app.route('/login/google')
def login_google():
    redirect_uri = url_for('authorized', _external=True)
    return google.authorize_redirect(redirect_uri)


@app.route('/callback/google')
def authorized():
    try:
        token = google.authorize_access_token()
        resp = google.get('userinfo', token=token)
        user_info = resp.json()
        
        # Check if user exists, if not, create a new user
        user = User.query.filter_by(google_id=user_info['id']).first()
        if not user:
            user = User(
                username=user_info['email'], 
                email=user_info['email'],
                google_id=user_info['id']
            )
            db.session.add(user)
            db.session.commit()
        
        # Set user session
        session['user_id'] = user.id
        
        # Redirect to frontend
        return redirect('https://instagraphix.pro?login_success=true')
    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 400

@app.route('/')
def index():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({'message': f'Logged in as {user.username}', 'credits': user.credits})
    return jsonify({'message': 'Not logged in'})


@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect('https://instagraphix.pro')



def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 401
        return f(user, *args, **kwargs)
    return decorated

@app.route('/api/get-lemon-squeezy-products', methods=['GET'])
@token_required
def get_lemon_squeezy_products(user):
    headers = {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': f'Bearer {LEMON_SQUEEZY_API_KEY}'
    }

    try:
        url = f'https://api.lemonsqueezy.com/v1/products?filter[store_id]={LEMON_SQUEEZY_STORE_ID}'
       
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        products_data = response.json()

        products = []
        for item in products_data.get('data', []):
            attributes = item.get('attributes', {})
            product = {
                'id': item.get('id'),
                'name': attributes.get('name'),
                'description': attributes.get('description'),
                'price': attributes.get('price'),
                'price_formatted': attributes.get('price_formatted'),
                'buy_now_url': attributes.get('buy_now_url'),
                'test_mode': attributes.get('test_mode', False)
            }
            products.append(product)

        return jsonify(products), 200
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to fetch products'}), 500
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500


@app.route('/api/generate_infographic', methods=['POST'])
@cross_origin(origins=["https://instagraphix.pro"], supports_credentials=True)
@token_required
def generate_infographic(user):
    try:
        if user.credits < 1:
            return jsonify({'message': 'Insufficient credits'}), 403
        
        data = request.json
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        print("Scraping Started")
        start_time = time.time()

        parsed_content = scrape_text(url)

        scraping_time = time.time() - start_time
        print(f"Scraping time is:{scraping_time}" )
        
        if not parsed_content:
            return jsonify({'error': 'Failed to scrape the webpage', 'details': 'The scraper returned no content'}), 500
        
        infographic_data = process_content_with_claude(parsed_content)
        
        if 'error' in infographic_data:
            return jsonify({'error': 'Error processing content', 'details': infographic_data}), 400
        
        infographic_results = generator.create_infographics(infographic_data)
        
        # Create Infographic object and deduct credit
        if infographic_results:
            infographic = Infographic(user_id=user.id, title=infographic_data['title'], image_url=infographic_results[0]['local_path'])
            user.credits -= 1
            db.session.add(infographic)
            db.session.commit()
            
            response_data = {
                'infographics': infographic_results,
                'content_data': infographic_data,
                'remaining_credits': user.credits
            }
            
            return jsonify(response_data)
        else:
            raise ValueError("Infographic generation failed")

    except Exception as e:
        db.session.rollback()
        error_details = {
            'error': f'Error generating infographic: {str(e)}',
            'traceback': traceback.format_exc()
        }
        app.logger.error(f"Error generating infographic: {error_details}")
        return jsonify(error_details), 500

@app.route('/api/add_credits', methods=['POST'])
@token_required
def add_credits(user):
    data = request.json
    amount = data.get('amount', 0)
    
    if amount <= 0:
        return jsonify({'message': 'Invalid credit amount'}), 400

    user.credits += amount
    try:
        db.session.commit()
        return jsonify({'message': 'Credits added successfully', 'new_balance': user.credits}), 200
    except:
        db.session.rollback()
        return jsonify({'message': 'Error adding credits'}), 500
    

@app.route('/api/get_config/<template_name>', methods=['GET'])
def get_config(template_name):
    config_path = os.path.join('templates', f'{template_name}_config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as config_file:
            config_data = json.load(config_file)
        return jsonify(config_data)
    else:
        return jsonify({'error': 'Config file not found'}), 404


# @app.route('/api/generate_from_scratch', methods=['POST'])
# @cross_origin(origins=["http://instagraphix.pro"], supports_credentials=True)
# @token_required
# def generate_from_scratch(user):
#     try:
#         if user.credits < 1:
#             return jsonify({'message': 'Insufficient credits'}), 403
        
#         data = request.json
#         topic = data.get('topic')
#         keywords = data.get('keywords', [])
#         print(keywords)
        
#         if not topic:
#             return jsonify({'error': 'Topic is required'}), 400
        
#         # Generate content using Claude
#         prompt = f"""Create an engaging but SHORT structure for an infographic about {topic}.

# Structure:
# 1. Title: Create a catchy, SEO-friendly title (2-3 words max) that INCLUDES the main keyword.
# 2. Introduction: Write a brief, compelling introduction (2-3 sentences) that outlines the main point of the infographic.
# 3. Main Content: Develop 3-5 key sections, each containing:
#    - A concise, attention-grabbing heading (1-2 words)
#    - A short, informative paragraph (2-3 sentences) explaining the main point
#    - If applicable, a relevant statistic or fact to support the information

# VERY Important Guidelines:
# - Seamlessly incorporate these keywords throughout the content for SEO optimization: {', '.join(keywords)}
# - Ensure all information is factual, current, and from reliable sources
# - Use a conversational tone, addressing the reader directly with "you" instead of third-person references
# - Keep the language clear, concise, and jargon-free to appeal to a wide audience
# - Focus on providing actionable insights or practical takeaways in each section
# - Avoid transition phrases or any language that suggests a longer written piece
# - Consider the visual nature of infographics - think in terms of bite-sized, impactful information

# Metadata (invisible in the infographic but crucial for SEO):
# - Include a meta description (150-160 characters) summarizing the infographic's content
# - List 5-7 relevant tags, including the provided keywords and related terms

# Remember, the goal is to create an infographic that is visually appealing, informative, and optimized for both user engagement and search engine visibility.

# Please format your response as a JSON structure with the following format:
# {{
#     "title": "Main title of the infographic",
#     "introduction": "Brief introduction text",
#     "sections": [
#         {{
#             "title": "Section 1 Title",
#             "points": ["A very short paragraph (2-3 sentences) explaining this section."]
#         }},
#         // More sections...
#     ]
# }}

# Important: The number of sections should be exactly 3 , 4 or 5."""

#         message = client.messages.create(
#             model="claude-3-haiku-20240307",
#             max_tokens=4000,
#             messages=[
#                 {"role": "user", "content": prompt}
#             ]
#         )

#         content = message.content[0].text if isinstance(message.content, list) else message.content

#         infographic_data = json.loads(content)
        
#         if len(infographic_data['sections']) not in [3, 4, 5]:
#             return jsonify({'error': f'Generated content does not have the requested number of sections'}), 400

#         infographic_results = generator.create_infographics(infographic_data)
        
#         # Create Infographic object and deduct credit
#         infographic = Infographic(user_id=user.id, title=infographic_data['title'], image_url=infographic_results[0]['local_path'])
#         user.credits -= 2
#         db.session.add(infographic)
#         db.session.commit()
        
#         response_data = {
#             'infographics': infographic_results,
#             'content_data': infographic_data,
#             'remaining_credits': user.credits
#         }
        
#         return jsonify(response_data)

#     except json.JSONDecodeError:
#         db.session.rollback()
#     except Exception as e:
#         db.session.rollback()
#         error_details = {
#             'error': f'Error generating infographic: {str(e)}',
#             'traceback': traceback.format_exc()
#         }
#         app.logger.error(f"Error generating infographic from scratch: {error_details}")
#         return jsonify(error_details), 500

import json
from jsonschema import validate, ValidationError
import traceback

@app.route('/', methods=['GET'])
@token_required
def one():
    return jsonify({'message': "It's working"})

@app.route('/api/generate_from_scratch', methods=['POST'])
@cross_origin(origins=["https://instagraphix.pro"], supports_credentials=True)
@token_required
def generate_from_scratch(user):
    try:
        if user.credits < 1:
            return jsonify({'message': 'Insufficient credits'}), 403
        
        data = request.json
        topic = data.get('topic')
        keywords = data.get('keywords', [])
        print(keywords)
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        # Generate content using Claude
        prompt = f"""Create an engaging but SHORT structure for an infographic about {topic}.

Structure:
1. Title: Create a catchy, SEO-friendly title (2-3 words max) that INCLUDES the main keyword.
2. Introduction: Write a brief, compelling introduction (2-3 sentences) that outlines the main point of the infographic.
3. Main Content: Develop 3-5 key sections, each containing:
   - A concise, attention-grabbing heading (1-2 words)
   - A short, informative paragraph (2-3 sentences) explaining the main point
   - If applicable, a relevant statistic or fact to support the information

VERY Important Guidelines:
- Seamlessly incorporate these keywords throughout the content for SEO optimization: {', '.join(keywords)}
- Ensure all information is factual, current, and from reliable sources
- Use a conversational tone, addressing the reader directly with "you" instead of third-person references
- Keep the language clear, concise, and jargon-free to appeal to a wide audience
- Focus on providing actionable insights or practical takeaways in each section
- Avoid transition phrases or any language that suggests a longer written piece
- Consider the visual nature of infographics - think in terms of bite-sized, impactful information

Metadata (invisible in the infographic but crucial for SEO):
- Include a meta description (150-160 characters) summarizing the infographic's content
- List 5-7 relevant tags, including the provided keywords and related terms

Remember, the goal is to create an infographic that is visually appealing, informative, and optimized for both user engagement and search engine visibility.

Please format your response as a JSON structure with the following format:
{{
    "title": "Main title of the infographic",
    "introduction": "Brief introduction text",
    "sections": [
        {{
            "title": "Section 1 Title",
            "points": ["A very short paragraph (2-3 sentences) explaining this section."]
        }},
        // More sections...
    ],
    "meta_description": "SEO meta description",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}}

Important: The number of sections should be exactly 3, 4 or 5."""

        max_retries = 3
        content = None
        for attempt in range(max_retries):
            try:
                message = client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=4000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )

                content = message.content[0].text if isinstance(message.content, list) else message.content

                # Validate JSON structure
                infographic_data = json.loads(content)
                validate(instance=infographic_data, schema=infographic_schema)

                if len(infographic_data['sections']) not in [3, 4, 5]:
                    raise ValueError("Generated content does not have the requested number of sections")

                # If we reach here, the data is valid
                break
            except (json.JSONDecodeError, ValidationError, ValueError) as e:
                if attempt == max_retries - 1:
                    raise
                app.logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying...")

        infographic_results = generator.create_infographics(infographic_data)
        
        # Create Infographic object and deduct credit
        if infographic_results:  
            infographic = Infographic(user_id=user.id, title=infographic_data['title'], image_url=infographic_results[0]['local_path'])
            user.credits -= 2
            db.session.add(infographic)
            db.session.commit()
            
            response_data = {
                'infographics': infographic_results,
                'content_data': infographic_data,
                'remaining_credits': user.credits
            }
            
            return jsonify(response_data)
        else:
            raise ValueError("Infographic generation failed")
    

    except (json.JSONDecodeError, ValidationError, ValueError) as e:
        db.session.rollback()
        error_details = {
            'error': f'Error processing Claude response: {str(e)}',
            'raw_response': content
        }
        app.logger.error(f"Error generating infographic from scratch: {error_details}")
        return jsonify(error_details), 400
    except Exception as e:
        db.session.rollback()
        error_details = {
            'error': f'Error generating infographic: {str(e)}',
            'traceback': traceback.format_exc()
        }
        app.logger.error(f"Error generating infographic from scratch: {error_details}")
        return jsonify(error_details), 500

# Define the expected schema for the infographic data
infographic_schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "introduction": {"type": "string"},
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "points": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["title", "points"]
            },
            "minItems": 3,
            "maxItems": 5
        },
        "meta_description": {"type": "string"},
        "tags": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 5,
            "maxItems": 7
        }
    },
    "required": ["title", "introduction", "sections", "meta_description", "tags"]
}



@app.route('/api/finalize_infographic', methods=['POST'])
@token_required
def finalize_infographic(user):
    data = request.json
    content_data = data.get('content_data')
    customizations = data.get('customizations')
    template_name = data.get('template_name')

    if not content_data or not template_name:
        return jsonify({'error': 'Content data and template name are required'}), 400

    try:
        template_config = next((config for config in generator.templates[len(content_data['sections'])] 
                                if config['filename'] == f"{template_name}_config.json"), None)
        
        if not template_config:
            return jsonify({'error': 'Template not found'}), 404

        if customizations:
            for element_type in ['title', 'subtitle', 'body']:
                if element_type in customizations:
                    template_config['fonts'][element_type][0] = customizations[element_type]['family']
                    template_config['fonts'][element_type][1] = customizations[element_type]['size']

        final_infographic = generator.create_infographics(content_data, template_config, customizations)[0]
        
        # Update the existing Infographic object
        infographic = Infographic.query.filter_by(user_id=user.id).order_by(Infographic.created_at.desc()).first()
        if infographic:
            infographic.image_url = final_infographic['local_path']
            db.session.commit()
        
        return jsonify({'final_infographics': [final_infographic]})
    except Exception as e:
        db.session.rollback()
        print(f"Error finalizing infographic: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Error finalizing infographic: {str(e)}'}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
