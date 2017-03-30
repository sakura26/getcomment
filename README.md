# getcomment

Simple nodejs app, generate a QRcode for comments. Currently customized for homebrew beers, but you can use it on many thing.

**There is some security issue to fix, only deploy on standalone machine**

PR Welcome!!

這個NodeJS專案使用Express.js與Mongo DB, 是我用來練手的，目的是給自釀朋友一個可以快速簡單地從朋友那邊得到品飲感想的小工具，不過也適合用在各種想要快速接收回應的小地方。

## Usage

* 進入網站首頁，輸入這支酒的相關資訊後送出，會生成這支酒的專屬頁面
* 將網址或QRCode發送給朋友就可以接收回應，回應會同步送往你的Email信箱
* 點選“輸出條碼”將可以直接印出酒標與條碼（A4）
* 也可以從首頁事先生成條碼，先貼再回頭寫酒的相關資料

## Function

* 酒的專屬頁面
* QRCode與酒標列印
* 用戶可針對該酒撰寫感想與評分
* 加強顯示的BJCP評審評語
* 允許自定回應格式
* ibon列印

## Install

### docker

別忘了改config.js跟做好port redirect

```
docker run -it --name getcomment -p 3001:3000 node:latest /bin/bash

RUN apt-get update
RUN apt-get install -y gzip git-core curl python libssl-dev pkg-config build-essential supervisor
RUN apt-get install -y node-express-generator mongodb libcairo2-dev  libpango1.0-dev libgif-dev g++
RUN apt-get install -y libjpeg8-dev
RUN apt-get install -y libjpeg62-turbo-dev
RUN cd ~ && git clone https://github.com/sakura26/getcomment && cd getcomment
RUN npm install express
RUN npm install -d
RUN npm install mongodb
RUN npm install mongo-sanitize mongoose
RUN npm install bluebird nodemailer
RUN npm install canvas
RUN npm install --save qrcode
RUN npm install xss-filters --save
/etc/init.d/mongodb start
bash /root/getcomment/watchdog.sh
RUN echo "* * * * * root bash /root/getcomment/watchdog.sh" >> /etc/crontab

# install PDF generator https://wkhtmltopdf.org/
RUN wget https://downloads.wkhtmltopdf.org/0.12/0.12.4/wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
RUN tar Jxf wkhtmltox-0.12.4_linux-generic-amd64.tar.xz
RUN sudo mv wkhtmltox /opt
RUN sudo echo "export PATH=$PATH:/opt/wkhtmltox/bin" >> /etc/profile.d/wk.sh
RUN npm install wkhtmltopdf
# u need to install fonts for chinese pdf support
#scp /Library/Fonts/*.ttf toserver
```


## todo

* BJCP judge management interface
* sort BJCP comments on top
* judge only score
* only Judge comments mode
* non-used thread garbage collect
* Image upload
* Mobile friendly
* 擺放點？
* Improve UI

### security fix todo:

* validate email to prevent spam
* sanitize all input