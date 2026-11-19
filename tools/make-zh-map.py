# -*- coding: utf-8 -*-
import cv2, numpy as np, os
from PIL import Image, ImageDraw, ImageFont

SRC='assets/overworld.jpg'; OUT='assets/overworld_zh.jpg'

L=[(1182,62,1639,100,'英雄与石块 · 西'),
   (520,67,792,125,'对跖之地'),
   (590,253,743,285,'出口'),
   (1041,341,1562,381,'英雄与光 · 进阶'),
   (1144,597,1459,637,'英雄与光'),
   (859,773,1267,806,'英雄与遗物'),
   (2237,159,2700,197,'英雄与水 · 北'),
   (1779,236,2087,275,'英雄齐聚'),
   (2652,418,3006,466,'英雄 · 复制'),
   (1737,449,2129,488,'英雄 3：吟游诗人与德鲁伊'),
   (2126,558,2489,589,'英雄与水'),
   (1756,670,2109,699,'英雄 2：怪物'),
   (2385,772,2743,804,'英雄与镜子'),
   (1766,880,2274,928,'搬运英雄'),
   (501,962,804,993,'光束反射'),
   (821,1109,1038,1140,'变换光束'),
   (356,1405,790,1446,'反射光束'),
   (419,1830,807,1870,'可映照光束'),
   (1367,935,1538,973,'推车与杆'),
   (1429,1081,1659,1113,'承诺之地'),
   (1831,1175,2034,1206,'交汇之地'),
   (1369,1338,1455,1367,'托尔克环'),
   (1784,1443,2081,1483,'飞石成径'),
   (1218,1564,1585,1596,'被照亮之石'),
   (1179,1817,1487,1855,'挤压与龙'),
   (2146,1081,2441,1113,'镜之群岛'),
   (2745,1121,3095,1153,'可映照之镜'),
   (2404,1688,2755,1720,'镜子与石块'),
   (2116,1955,2556,1993,'英雄与石块 · 东')]

UI=[(8,6,78,142),(90,14,410,155),(3270,6,3815,86)]

img=cv2.imread(SRC); H,W=img.shape[:2]
hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV); V,S=hsv[:,:,2],hsv[:,:,1]

mask=np.zeros((H,W),np.uint8)
for (x0,y0,x1,y1,cn) in L:
    p=6
    sx0,sy0=max(0,x0-p),max(0,y0-p); sx1,sy1=min(W,x1+p),min(H,y1+p)
    sub=((V[sy0:sy1,sx0:sx1]>=180)&(S[sy0:sy1,sx0:sx1]<=125)).astype(np.uint8)
    n,lab,st,ce=cv2.connectedComponentsWithStats(sub,8)
    keep=np.zeros_like(sub)
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if h<=48 and w<=90:
            keep[lab==i]=1
    # 把紧邻文字的深色描边一起纳入遮罩，避免残留灰斑
    near=cv2.dilate(keep,np.ones((21,21),np.uint8))
    dark=(V[sy0:sy1,sx0:sx1]<85).astype(np.uint8)
    keep=np.maximum(keep, dark*near)
    keep=cv2.dilate(keep,np.ones((5,5),np.uint8))
    mask[sy0:sy1,sx0:sx1]=np.maximum(mask[sy0:sy1,sx0:sx1],keep)
for (x0,y0,x1,y1) in UI:
    mask[y0:y1,x0:x1]=1
mask=cv2.dilate(mask,np.ones((3,3),np.uint8))
out=cv2.inpaint(img,mask,7,cv2.INPAINT_TELEA)

pil=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB))
d=ImageDraw.Draw(pil)
FP='C:/Windows/Fonts/msyhbd.ttc'
if not os.path.exists(FP):
    FP='C:/Windows/Fonts/msyh.ttc'
SPACING=2.0

def measure(text, size):
    f=ImageFont.truetype(FP,size)
    w=0
    for ch in text:
        bb=d.textbbox((0,0),ch,font=f)
        w+=bb[2]-bb[0]+SPACING
    bb=d.textbbox((0,0),text,font=f)
    return w-SPACING, bb[3]-bb[1]

def pick(text, maxw, lo=22, hi=38):
    s=hi
    while s>lo:
        w,_=measure(text,s)
        if w<=maxw: return s
        s-=1
    return lo

for (x0,y0,x1,y1,cn) in L:
    cx,cy=(x0+x1)/2,(y0+y1)/2
    size=pick(cn,(x1-x0)*1.06)
    f=ImageFont.truetype(FP,size)
    total,_=measure(cn,size)
    x=cx-total/2
    for ch in cn:
        bb=d.textbbox((0,0),ch,font=f)
        cw=bb[2]-bb[0]
        d.text((x-bb[0], cy-(bb[3]-bb[1])/2-bb[1]), ch, font=f,
               fill=(247,240,222), stroke_width=2, stroke_fill=(18,13,8))
        x+=cw+SPACING
pil.save(OUT,quality=92)
print('saved',pil.size)
