from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageFilter
import os
IMG='/tmp/claude-0/-home-user-Prime-Blocks-Tech/1a1ca4af-152e-556c-bbb7-185f11e9b244/images/'
OUT='/home/user/Prime-Blocks-Tech/video-assets/pte-logos/'
W,H=1920,1080
def trim(im):
    im=im.convert('RGBA')
    bg=Image.new('RGBA',im.size,(255,255,255,255))
    flat=Image.alpha_composite(bg,im).convert('RGB')
    diff=ImageChops.difference(flat,Image.new('RGB',im.size,(255,255,255))).convert('L').point(lambda v:255 if v>18 else 0)
    return Image.alpha_composite(bg,im).crop(diff.getbbox())
logos=[trim(Image.open(IMG+f)) for f in ['2.png','3.jpg','4.jpg']]
S=2  # supersample
ov=Image.new('RGBA',(W*S,H*S),(0,0,0,0))
d=ImageDraw.Draw(ov)
x0,cardH,pad,gap=160,120,14,18
y0=928
# label, same style as "PORTABLE TURBINE ENERGY"
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',15*S)
x=x0*S
for ch in "IN PARTNERSHIP WITH":
    d.text((x,(y0-34)*S),ch,font=font,fill=(126,200,227,255)); x+=d.textlength(ch,font=font)+5*S
x=x0
inner=cardH-2*pad
for lg in logos:
    cw=250; mw=cw-2*pad-12
    h=inner; w=round(lg.width*h/lg.height)
    if w>mw: w=mw; h=round(lg.height*w/lg.width)
    shadow=Image.new('RGBA',ov.size,(0,0,0,0))
    ImageDraw.Draw(shadow).rounded_rectangle(((x)*S,(y0+6)*S,(x+cw)*S,(y0+cardH+6)*S),14*S,fill=(0,0,0,110))
    ov=Image.alpha_composite(ov,shadow.filter(ImageFilter.GaussianBlur(10*S)))
    d=ImageDraw.Draw(ov)
    d.rounded_rectangle((x*S,y0*S,(x+cw)*S,(y0+cardH)*S),14*S,fill=(255,255,255,245))
    ov.paste(lg.resize((w*S,h*S),Image.LANCZOS),((x+(cw-w)//2)*S,(y0+(cardH-h)//2)*S))
    x+=cw+gap
ov=ov.resize((W,H),Image.LANCZOS)
ov.save(OUT+'logos_overlay_1920x1080.png')
# preview on slide screenshot
sl=Image.open(IMG+'1.webp').convert('RGB').crop((0,0,1823,920)).resize((W,H),Image.LANCZOS).convert('RGBA')
Image.alpha_composite(sl,ov).convert('RGB').save(OUT+'preview_last_slide.jpg',quality=92)
print('done', x)
