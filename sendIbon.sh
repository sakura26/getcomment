id=$1
email=$3
file=$2
curl "https://www.ibon.com.tw/printscan_ie_innerifrm.aspx" > /tmp/$id-ibon
vs=`cat /tmp/$id-ibon | grep __VIEWSTATE | sed 's/value="/\^/g'| cut -d'^' -f 2 | cut -d'"' -f 1`
ev=`cat /tmp/$id-ibon | grep __EVENTVALIDATION | sed 's/value="/\^/g'| cut -d'^' -f 2 | cut -d'"' -f 1`
#hs=`cat /tmp/$id-ibon | grep hsTime | grep hidden | sed 's/value="/\^/g'| cut -d'^' -f 2 | cut -d'"' -f 1`
curl -F "txtUserName=user" -F "txtEmail=$email" -F "fuFile=@$file" -F "chkboxAgree=on" -F "hidDevice=0" -F "hsTime=$hs" -F "lnkbtnUpload=確認上傳" -F "__VIEWSTATE=$vs" -F "__EVENTVALIDATION=$ev" "https://www.ibon.com.tw/printscan_ie_innerifrm.aspx"