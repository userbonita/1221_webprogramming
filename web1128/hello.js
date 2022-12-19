const http=require('http');
const fs=require('fs');
const url=require('url');
const qs=require('querystring');
require('dotenv').config();
var ip=process.env.IP;
var port=process.env.PORT;
function templateHTML(title,style,contents){
    var template=`<!DOCTYPE html>
    <html>
        <head>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-YZ8M3277RX"></script>
            <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
    
            gtag('config', 'G-YZ8M3277RX');
            </script>
            <meta charset="utf-8">
            <title>${title}</title>
            <link rel="stylesheet" href="style.css">
            ${style}
        </head>
        <body>
            <a href="/?id=index"><h1>나의 작품집</h1></a>
            <div id="grid">
                <div id="menu">
                <ul style="font-weight: bold;">
                <li>
                    <a href="/?id=profile" style="color:black">프로필</a>
                </li>
                <br>
                <li>
                    <a href="/?id=award" style="color:black">수상 기록</a>
                </li>
                <br>
                <li>
                    <a href="/?id=license" style="color:black">자격증</a>
                </li>
                <br>
                <li>
                    <a href="/?id=plan" style="color:black">단기 계획</a>
                </li>
                <br>
                <li>
                    <a href="/?id=visitor" style="color:black">방명록</a>
                </li>
                <div style="height:400px"></div>
    
                </ul>
                </div>
                ${contents}
           </div>
        </body>
    </html>`;
    return template;
}

function getProfile(motto,strength,weakness){
    var template=`        <div id="grid1">
    <div style="padding:20px;">
        <span style="font-size: 20px; font-weight: bold;">사진</span>
        <br>
        <br>
        <img src="profile.jpg" title="증명사진" alt="대표 이미지" width="150" height="150" >
        <br>
        <br>
        <span style="font-weight:bold; text-align: center;">학력</span>
        <span></span>
        <br>
        <span style="font-weight:bold; text-align: center;">전공</span>
        <span></span>
        <br>
        <span style="font-weight:bold; text-align: center;">복수 전공</span>
        <span></span>
    </div>
    <div style="border-left:1px black solid; border-right:2px black solid;  padding:20px;">
        <span style="font-weight:bold;  font-size: 20px;">나의 좌우명</span><a href="/?id=profile&type=form&title=motto&add=0" style="margin-left:10px;"><input type="button" method="post" value="update"></a>
        <br>
        <br>
        <span style="font-family:nanum; font-weight:bold">
        ${motto}
        </span>
    </div>
    <div style="border:1px black solid; border-left:0; padding:20px;">
        
        <span style="font-weight:bold; font-size: 20px;">나의 장점</span>
        <img src="smile.jpg" alt="웃는 아이콘" width="17px" ><a href="/?id=profile&type=form&title=strength&add=1" style="margin-left:10px;"><input type="button" method="post" value="add"></a>
        <a href="/?id=profile&type=form&title=strength&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete"></a>
        <br>
        <ul>
            ${strength}
        </ul>
    </div>
    <div style="border-top:1px black solid; border-bottom:1px solid black; border-right:2px black solid; padding:20px;">
        <span style="font-weight:bold;  font-size: 20px;">나의 단점</span>
        <img src="cry.jpg" alt="우는 아이콘" width="17px"><a href="/?id=profile&type=form&title=weakness&add=1" style="margin-left:10px;"><input type="button" method="post" value="add"></a>
        <a href="/?id=profile&type=form&title=weakness&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete"></a>
        <br>
        <ul>
            ${weakness}
        </ul>
    </div>
    <div style="padding:20px; border-bottom:2px black solid;">
        <span style="font-weight:bold;  font-size: 20px;">최종 수정일 </span> 
        <span >22년 6월 19일</span> 
    </div>
    <div  style="border-bottom:2px black solid; border-right:2px black solid;">
    </div>
    </div>`;
    return template;
}

function getPlan(period,planDir){
    return `
        <div id="grid1">
        <div style="border-bottom: 1px solid black; " id="grid2">
            <div style="font-weight: bold; font-size:30px;  border-right:1px solid black;text-align: center;">기간</div>
            <div style="padding-left:10px;font-size:25px;">${period}<a href="/?id=plan&type=form&title=기간입력&add=0" style="margin-left:30px;"><input type="button" method="post" value="update"></a><a href="/?id=plan&type=form&title=항목&add=1" style="margin-left:10px;"><input type="button" method="post" value="add"></a>
            <input id="button" type="button" value="blue" onclick=" 
            var list=document.querySelectorAll('.grid3');
            if(this.value==='black'){
                for(var i=0;i<list.length;i++){
                    list[i].style.color='black';
                }
                this.value='blue';
            }
            else{
                for(var i=0;i<list.length;i++){
                    list[i].style.color='blue';
                }
                this.value='black';                
            }
                ">
            </div>
            </div>
        <div>
            ${planDir}
        </div>
    </div>
    `;

}
function getForm(_filename,title,add,readonly){
    return `<html>
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <form action="http://${ip}:${port}/add" method="post">
        <input type="hidden" name="add" value=${add} >
        <input type="hidden" name="_filename" value=${_filename} >
        <input type="text" name="title" value=${title} ${readonly}>
        <textarea name="description"cols="30" rows="10"></textarea>
        <input type="submit" value="제출"> 
        </form>
    </body>
</html>`;
}

function manageFile(post,response){
    console.log('post   :  %s\n',post);
    fs.readFile(`contents/${post._filename}_${post.title}`,'utf-8',(err,data)=>{
        if(post.add==='1'){data+=`<li>${post.description}</li><br>`;}
        else if(post.add==='0')data=post.description;
        else if(post.add==='-1')data="";
        fs.writeFile(`contents/${post._filename}_${post.title}`,data,'utf8',(err)=>{
            response.writeHead(302,{Location: `/?id=${post._filename}`});
            response.end();
        });
    });   
}

http.createServer((request,response)=> {

    var _url=request.url;

    var queryData=url.parse(_url,true).query;
    var pathname=url.parse(_url,true).pathname;
     console.log('query: %s\n',queryData);
     console.log(`pathname: ${pathname}\n`);
     
     if(pathname==='/'){//http://localhost:.../?id=...
         var title;
         if(queryData.id===undefined){
            title='index';
         }
         else{
             title=queryData.id;
         }
         //title에 값 주면 파일 읽어들이기
        //  fs.readFile(`contents/${title}_content`,'utf-8',(err,contents)=>{
        //      fs.readFile(`contents/${title}_style`,'utf-8',(err,style)=>{
        //         console.log('style: '+'\n'+style);
        //         console.log('contents: \n'+contents);

        //         var template=templateHTML(title,style,contents);
        //         response.end(template);
        //  });
        //  });
        if(title==='profile'){
            if(queryData.type==='form'){
                if(queryData.add==='-1'){
                    fs.writeFile(`contents/${queryData.id}_${queryData.title}`,"",'utf-8',(err)=>{
                        response.writeHead(302,{Location: `/?id=${queryData.id}`});
                        response.end();
                    });
                }
                else response.end(getForm(title,queryData.title,queryData.add,"readonly"));
            }
            else{
                console.log('profile in\n');
                fs.readFile(`contents/profile_motto`,'utf-8',(err,motto)=>{
                    fs.readFile(`contents/profile_strength`,'utf-8',(err,strength)=>{
                        fs.readFile(`contents/profile_weakness`,'utf-8',(err1,weakness)=>{
                            fs.readFile(`contents/${title}_style`,'utf-8',(err2,style)=>{
                                var contents=getProfile(motto,strength,weakness);
                                response.writeHead(200);
                                response.end(templateHTML(title,style,contents));
                            });
                        });
                    });    
                });
            
            }

        }
        else if(title==='plan'){
            if(queryData.type==='form'){//파일 수정,삭제,추가
                if(queryData.add==='-1'){                
                    fs.unlink(`contents/plan/${queryData.title}`,(err)=>{
                        response.writeHead(302,{Location:`/?id=${title}`});
                        response.end();
                    });
                }
                else if(queryData.add==='0'){//update
                    response.end(getForm(title,queryData.title,queryData.add,"readonly"));
                }
                else response.end(getForm(title,queryData.title,queryData.add,""));
            }
            else{//화면에 보이기  
                
                var style=fs.readFileSync('contents/plan_style','utf-8');

                var period= fs.readFileSync('contents/plan_period','utf-8');

                var filelist=fs.readdirSync('contents/plan')
      
                var description="";
                for(var i=0;i<filelist.length;i++){
                    var data=fs.readFileSync(`contents/plan/${filelist[i]}`);
                    description+=data;
                }      
                var contents=getPlan(period,description);
                response.end(templateHTML(title,style,contents));    

                // fs.readFile('contents/plan_style',(err,data)=>{
                //     console.log('style:: %s\n',data);//0
                //     fs.readFile('contents/plan_period',(err1,data1)=>{//0
                //         console.log('period: %s',data1);//x
                //          fs.readdir('contents/plan',(err,filelist)=>{
                //             var description="";
                //             var i=0;
                //             filelist.forEach((value, index, arraylist) => {
                                
                //             })
                //             for(var i=0;i<filelist.length;i++){
                //                 console.log('I::::: %s\n',i);
                //                 console.log('len: %d\n',filelist.length);
                //                 console.log('filedir1: %s',filelist[i]);
                //                 fs.readFile(`contents/plan/${filelist[i]}`,'utf-8',(err1,data)=>{
                //                     description+=data;
                //                     console.log('in description: %s\n',description);
                //                     console.log("i: %d\n",i);
                //                     if(i==(filelist.length-1)){
                //                         console.log('description: %s\n',description);
                //                         var contents=getPlan(data1,description);
                //                         console.log('contents: %s\n',contents);
                //                         response.end(templateHTML(title,data,contents));                                         
                //                     }
                //                 });
                //             }
                //         // console.log('description: %s\n',description);
                //         // var contents=getPlan('겨울',description);
                //         // console.log('contents: %s\n',contents);
                //         // response.end(templateHTML(title,data,contents));           
                //         });    
                //     });
                // });
            
            }


        }
        else{
             fs.readFile(`contents/${title}_content`,'utf-8',(err,contents)=>{
             fs.readFile(`contents/${title}_style`,'utf-8',(err,style)=>{
             console.log('style: '+'\n'+style);
             console.log('contents: \n'+contents);

             var template=templateHTML(title,style,contents);
             response.end(template);
         });
         });
        }
     } 

     else if(pathname==='/add'){
        var body='';
        request.on('data',(data)=>{
            body+=data;
        });
        request.on('end',()=>{
            var post=qs.parse(body);
            if(post._filename==='profile')manageFile(post,response);
            else if(post._filename==='plan'){
                if(post.add==='0'){//기간 업데이트
                    fs.writeFile('contents/plan_period',post.description,'utf-8',(err)=>{
                        response.writeHead(302,{Location:'/?id=plan'});
                        response.end();
                    });
                }
                else if(post.add==='1'){//할 일 추가
                    var description=`<div class="grid3" style="border-bottom:1px solid black; font-size:20px;height:80px"  >
                    <span style="font-weight: bold;">${post.title}</span><span>${post.description}<a href="/?id=plan&type=form&title=${post.title}&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete"></a></span>
                </div>`;
                    fs.writeFile(`contents/plan/${post.title}`,description,'utf-8',(err)=>{
                        response.writeHead(302,{Location:'/?id=plan'});
                        response.end();                      
                    });
                }
            }
        });
     }
     else if(pathname==='/favicon.ico'){
          response.writeHead(404);
          response.end();
     }
     else{
         response.end(fs.readFileSync(__dirname+pathname));
     }
     // else{
     //     response.writeHead(404);
     //     response.end('NOT FOUND');
     // }
 

}).listen(port);