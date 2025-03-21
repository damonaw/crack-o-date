from PIL import Image
import os

def create_favicon(size):
    # Open the source image
    source_image = Image.open("DALL·E 2025-03-21 13.56.46 - A minimalist app icon combining a calculator and calendar, designed using Material Design and iOS icon guidelines. The icon has a clean, modern aesthe.webp")
    
    # Convert to RGBA if not already
    if source_image.mode != 'RGBA':
        source_image = source_image.convert('RGBA')
    
    # Resize the image
    resized_image = source_image.resize((size, size), Image.Resampling.LANCZOS)
    
    return resized_image

def main():
    # Create output directory if it doesn't exist
    if not os.path.exists('favicon'):
        os.makedirs('favicon')
    
    # Generate different sizes
    sizes = {
        'favicon.ico': [(16, 16), (32, 32), (48, 48)],
        'favicon-16x16.png': [(16, 16)],
        'favicon-32x32.png': [(32, 32)],
        'apple-touch-icon.png': [(180, 180)],
        'android-chrome-192x192.png': [(192, 192)],
        'android-chrome-512x512.png': [(512, 512)]
    }
    
    for filename, size_list in sizes.items():
        if filename.endswith('.ico'):
            # For ICO file, create multiple sizes
            images = []
            for size in size_list:
                images.append(create_favicon(size[0]))
            # Save as ICO
            images[0].save(filename, format='ICO', sizes=[(img.width, img.height) for img in images])
        else:
            # For PNG files, create single size
            size = size_list[0][0]
            image = create_favicon(size)
            image.save(filename, 'PNG')
        print(f"Generated {filename}")

if __name__ == '__main__':
    main() 