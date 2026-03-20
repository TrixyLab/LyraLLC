import os
from PIL import Image, ImageOps

imgs = ['Images/valorant.png', 'Images/LOL.png', 'Images/Apex.png', 'Images/Finals.jpg', 'Images/Halo.png', 'Images/RL.webp']

RED_BG = (232, 0, 45, 255) # E8002D

for filepath in imgs:
    if not os.path.exists(filepath): continue
    try:
        img = Image.open(filepath).convert('RGBA')
        datas = img.getdata()
        new_data = []
        for item in datas:
            # If color is close to white or grey (checkerboard logic)
            # Checkerboard is usually grey/white. 
            r, g, b, a = item
            # Check for white background or grey fake pattern
            if (r > 180 and g > 180 and b > 180 and abs(r-g)<20 and abs(g-b)<20) or a == 0:
                # Replace with Lyra Red
                new_data.append(RED_BG)
            else:
                # Replace with white (to make the logo white on red)
                new_data.append((255, 255, 255, 255))
        
        img.putdata(new_data)
        
        # We need a rounded corner box.
        # But this is simple processing
        new_filename = os.path.splitext(filepath)[0] + 'real.png'
        img.save(new_filename)
        print(f"Processed {filepath} -> {new_filename}")
    except Exception as e:
        print(f"Failed {filepath}: {e}")

