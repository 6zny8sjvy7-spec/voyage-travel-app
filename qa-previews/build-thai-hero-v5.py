"""Build Thai hero as two independent WebP layers; preserves Bangkok scenery.
Source: high-resolution approved-scene WebP committed to this repo.
Outputs: clear static city background plus alpha-only airplane PNG/WebP sprite.
Do not modify any other countries' art.
"""
from PIL import Image
from pathlib import Path
import cv2,numpy as np
ROOT=Path(__file__).resolve().parent.parent
A=ROOT/'v2-review-20261112'/'assets'
source=A/'voyage-thai-scene-source-v5.webp'
rgb=np.array(Image.open(source).convert('RGB'))
h,w=rgb.shape[:2]
assert w>=1600 and h>=900,(w,h)
# Extract aircraft from original exact scene before inpainting it out.
x0,y0,x1,y1=792,51,1115,172
crop=rgb[y0:y1,x0:x1].copy();ch,cw=crop.shape[:2]
mask=np.full((ch,cw),cv2.GC_PR_BGD,np.uint8)
poly=np.array([[8,67],[32,51],[52,38],[79,30],[107,34],[135,28],[164,19],[229,9],[291,10],[315,21],[312,42],[281,53],[249,61],[208,77],[184,87],[157,88],[120,95],[81,94],[34,93]],np.int32)
cv2.fillPoly(mask,[poly],cv2.GC_PR_FGD)
hsv=cv2.cvtColor(cv2.cvtColor(crop,cv2.COLOR_RGB2BGR),cv2.COLOR_BGR2HSV)
inside=np.zeros((ch,cw),np.uint8);cv2.fillPoly(inside,[poly],255)
white=(hsv[:,:,1]<80)&(hsv[:,:,2]>132)
tail=(hsv[:,:,0]>100)&(hsv[:,:,0]<134)&(hsv[:,:,1]>85)&(hsv[:,:,2]<170)
mask[(inside>0)&(white|tail)]=cv2.GC_FGD
mask[:4,:]=cv2.GC_BGD;mask[-10:,:]=cv2.GC_BGD;mask[:,:6]=cv2.GC_BGD;mask[:,-6:]=cv2.GC_BGD
cv2.grabCut(cv2.cvtColor(crop,cv2.COLOR_RGB2BGR),mask,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),7,cv2.GC_INIT_WITH_MASK)
alpha=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
n,l,stats,_=cv2.connectedComponentsWithStats(alpha,8)
if n>1:
 order=np.argsort(stats[1:,cv2.CC_STAT_AREA])[::-1]+1
 keep=np.zeros_like(alpha)
 for ix in order[:3]:
  if stats[ix,cv2.CC_STAT_AREA]>=15:keep[l==ix]=255
 alpha=keep
alpha=cv2.morphologyEx(alpha,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
alpha=cv2.GaussianBlur(alpha,(3,3),.65)
plane=Image.fromarray(np.dstack([crop,alpha]),'RGBA').crop(Image.fromarray(alpha).getbbox())
plane.save(A/'voyage-thai-airplane-v5.webp','WEBP',lossless=True,method=6)
# Remove static airplane and two trails. Reconstruct only blue sky using
# a local polynomial fitted to original unaffected sky pixels, not other landmarks.
old=rgb.astype(np.float32)
paint=np.zeros((h,w),np.uint8)
cv2.rectangle(paint,(775,35),(1084,179),255,-1)
cv2.rectangle(paint,(1084,40),(1112,105),255,-1)
cv2.polylines(paint,[np.array([[305,230],[840,136]],np.int32)],False,255,34)
cv2.polylines(paint,[np.array([[376,238],[839,154]],np.int32)],False,255,34)
ys,xs=np.mgrid[0:260:2,0:1170:3];pix=old[ys,xs]
valid=(pix[:,:,0]<42)&(pix[:,:,1]>146)&(pix[:,:,2]>218)&(paint[ys,xs]==0)
X=xs[valid].astype(np.float64)/w;Y=ys[valid].astype(np.float64)/h
basis=np.stack([np.ones_like(X),X,Y,X*X,Y*Y,X*Y],axis=1)
coeffs=np.linalg.lstsq(basis,pix[valid].astype(np.float64),rcond=None)[0]
yy,xx=np.mgrid[:h,:w];u=xx.astype(np.float64)/w;v=yy.astype(np.float64)/h
sky=np.stack([np.ones_like(u),u,v,u*u,v*v,u*v],axis=-1)@coeffs
blend=cv2.GaussianBlur(paint,(49,49),0).astype(np.float32)[:,:,None]/255
clean=np.clip(old*(1-blend)+np.clip(sky,0,255).astype(np.float32)*blend,0,255).astype(np.uint8)
Image.fromarray(clean,'RGB').save(A/'voyage-thai-clean-v5.webp','WEBP',quality=82,method=6)
assert plane.width>150 and plane.height>25
assert (A/'voyage-thai-clean-v5.webp').stat().st_size>100_000
print('TH scene v5 clean,',w,'x',h,'plane',plane.size)
