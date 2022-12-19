const http=require('http');
const fs=require('fs');
const url=require('url');
const qs=require('querystring');
const { getPackedSettings } = require('http2');
const mysql=require('mysql');
require('dotenv').config();
//const { debugPort } = require('process');

var ip=process.env.IP;
var port=process.env.PORT;
var upload_port=process.env.UPLOAD_PORT;
const express=require('express');
const bodyParser=require('body-parser');
const multer=require('multer');
var _storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/');
    },
    filename: function(req,file,cb){
        cb(null,`${id}.jpg`);
    }
});
const upload=multer({storage:_storage});
const app=express();
app.use(bodyParser.urlencoded({extended: false}));
const server=http.createServer(app);
var id=1;

const db=mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:`${process.env.DB_PW}`,
    database:`${process.env.DB_SCHEMA}`
});

db.connect();

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

function getProfile(level,major,minor,motto,strength,weakness,today){
    var profile="profile.jpg";
    if(fs.existsSync(`./uploads/${id}.jpg`)){
        profile=`./uploads/${id}.jpg`;
    }
    var template=`        <div id="grid1">
    <div style="padding:20px;">
        <span style="font-size: 20px; font-weight: bold;">프로필</span><a href="/?id=profile&type=form&title=profile_img&add=0" style="margin-left:10px;"><input type="button" method="post" value="img" class="button"></a><a href="/?id=profile&type=form&title=profile&add=0" style="margin-left:10px;"><input type="button" method="post" value="text" class="button"></a>
        <br>
        <br>
        <img src="${profile}" title="증명사진" alt="대표 이미지" width="150" height="150" >
        <br>
        <br>
        <span style="font-weight:bold; text-align: center;">학력</span>
        <span>${level}</span>
        <br>
        <span style="font-weight:bold; text-align: center;">전공</span>
        <span>${major}</span>
        <br>
        <span style="font-weight:bold; text-align: center;">복수 전공</span>
        <span>${minor}</span>
    </div>

    <div style="border-left:1px black solid; border-right:2px black solid;  padding:20px;">
        <span style="font-weight:bold;  font-size: 20px;">나의 좌우명</span><a href="/?id=profile&type=form&title=motto&add=0" style="margin-left:10px;"><input type="button" method="post" value="update" class="button"></a>
        <br>
        <br>
        <span style="font-family:nanum; font-weight:bold">
        ${motto}
        </span>
    </div>

    <div style="border:1px black solid; border-left:0; padding:20px;">
        
        <span style="font-weight:bold; font-size: 20px;">나의 장점</span>
        <img src="smile.jpg" alt="웃는 아이콘" width="17px" ><a href="/?id=profile&type=form&title=strength&add=1" style="margin-left:10px;"><input type="button" method="post" value="add" class="button"></a>
        <a href="/?id=profile&type=form&title=strength&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete" class="button"></a>
        <br>
        <ul>
            ${strength}
        </ul>
    </div>

    <div style="border-top:1px black solid; border-bottom:1px solid black; border-right:2px black solid; padding:20px;">
        <span style="font-weight:bold;  font-size: 20px;">나의 단점</span>
        <img src="cry.jpg" alt="우는 아이콘" width="17px"><a href="/?id=profile&type=form&title=weakness&add=1" style="margin-left:10px;"><input type="button" method="post" value="add" class="button"></a>
        <a href="/?id=profile&type=form&title=weakness&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete" class="button"></a>
        <br>
        <ul>
            ${weakness}
        </ul>
    </div>

    <div style="padding:20px; border-bottom:2px black solid;">
        <span style="font-weight:bold;  font-size: 20px;">최종 수정일 </span> 
        <span >${today}</span> 
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
            <div style="padding-left:10px;font-size:25px;">${period}<a href="/?id=plan&type=form&title=기간입력&add=0" style="margin-left:30px;"><input type="button" method="post" value="update" class="button"></a><a href="/?id=plan&type=form&title=항목&add=1" style="margin-left:10px;"><input type="button" method="post" value="add" class="button"></a>
            <input id="_button" type="button" value="blue" onclick=" 
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
                " class="button">
            </div>
            </div>
        <div>
            ${planDir}
        </div>
    </div>
    `;

}

function getUpload(){
   return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <style>
            input{
                border: 1px solid #008f6bb9;
                font:12px;
                font-weight:bold;
                color:#008f6bb9;
                border-radius: 10px;
            }        
            </style>
    </head>
    <body>
        <form action="http://${ip}:${upload_port}/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="userfile" >
            <input type="submit" class="button" value="제출">     
        </form>
    </body>
</html>`
}

function getForm(_filename,title,add,readonly){
    return `<html>
    <head>
        <meta charset="utf-8">
        <style>
        input{
            border: 1px solid #008f6bb9;
            font:12px;
            font-weight:bold;
            color:#008f6bb9;
            border-radius: 10px;
        }        
        </style>

    </head>
    <body>
        <form action="http://${ip}:${port}/add" method="post">
        <input type="hidden" name="add" value=${add} >
        <input type="hidden" name="_filename" value=${_filename} >
        <input type="text" name="title" value=${title} ${readonly}>
        <textarea name="description"cols="20" rows="10"></textarea>
        <input type="submit" value="제출" > 
        </form>
    </body>
</html>`;
}

function getprofileForm(_filename){
    return `<html>
    <head>
        <meta charset="utf-8">
        <style>
        input{
            border: 1px solid #008f6bb9;
            font:12px;
            font-weight:bold;
            color:#008f6bb9;
            border-radius: 10px;
        }        
        </style>
    </head>
    <body>
        <form action="http://${ip}:${port}/add" method="post">
        <input type="hidden" name="_filename" value=${_filename} >
        <input type="text" name="level" value='학력'>
        <input type="text" name="major" value='전공'>
        <input type="text" name="minor" value='복수 전공'>
        <input type="submit" value="제출"> 
        </form>
    </body>
</html>`;
}

function manageFile(post,response){
    console.log('post   :  %s\n',post);
    //fs.readFile(`contents/${post._filename}_${post.title}`,'utf-8',(err,data)=>{
        if(post.add==='1'){
            //data+=`<li>${post.description}</li><br>`;
            db.query(`insert into ${post.title}(id,content) values(${id},'${post.description}')`,(err)=>{
                if(err)console.log(err);
                response.writeHead(302,{Location:'/?id=profile'});
                response.end();  
            })            
        }
        else if(post.add==='0'){
            db.query(`update profile set motto='${post.description}' where id=${id}`,(err)=>{
                if(err)console.log(err);
                response.writeHead(302,{Location:'/?id=profile'});
                response.end();  
            })
        }
        // else if(post.add==='-1'){
        //     console.log("one in");
        //     db.query(`delete from ${post.title} where id=${id}`,(err)=>{
        //         if(err)console.log(err);
        //         response.writeHead(302,{Location:'/?id=profile'});
        //         response.end();  
        //     });
        //     //data="";
        // }
        // fs.writeFile(`contents/${post._filename}_${post.title}`,data,'utf8',(err)=>{
        //     response.writeHead(302,{Location: `/?id=${post._filename}`});
        //     response.end();
        // });
   // });   
}

app.post('/upload',upload.single('userfile'),function(req,res){
    console.log(req.file);
    return res.redirect(`http://${ip}:${port}/?id=profile`);
});

server.listen(upload_port,()=>{
    console.log('upload server running');
});

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
            if(queryData.title==='profile_img'){//프로필 이미지 업데이트
                var contents=getUpload();
                response.writeHead(200);
                response.end(contents);
            }

            else if(queryData.title==='profile'){
                var today=new Date();
                var date=today.toLocaleString();
                console.log(`date: ${date}`);
                db.query(`insert into today(id,date) values(${id},'${date}') on duplicate key update id=${id}, date='${date}'`,(err,result)=>{
                    if(err)console.log(err);
                });
                response.writeHead(200);
                response.end(getprofileForm('db_profile'));
            }
            else if(queryData.type==='form'){
                var today=new Date();
                var date=today.toLocaleString();
                db.query(`insert into today(id,date) values(${id},'${date}') on duplicate key update id=${id}, date='${date}'`,(err,result)=>{
                    if(err)console.log(err);
                });
                if(queryData.add==='-1'){
                    db.query(`delete from ${queryData.title} where id=${id}`,(err)=>{
                        if(err)console.log(err);
                        response.writeHead(302,{Location:'/?id=profile'});
                        response.end();  
                    });
                }
                else response.end(getForm(title,queryData.title,queryData.add,"readonly"));
            }
            else{
                console.log('profile in\n');
                // var motto=fs.readFileSync(`contents/profile_motto`,'utf-8');  
                var strength="";      
                db.query(`SELECT*FROM strength where id=${id}`,function(error,result){
                    if(error) console.log(error);
                    for(var i=0;i<result.length;i++){
                        strength+=`<li>${result[i].content}</li>`;
                    }
                });
                var weakness="";                             
                db.query(`SELECT*FROM weakness where id=${id}`,function(error,result){
                    if(error) console.log(error);
                    for(var i=0;i<result.length;i++){
                        weakness+=`<li>${result[i].content}</li>`;
                    }
                });  
                var today="";
                db.query(`SELECT*FROM today where id=${id}`,function(error,result){
                    if(error) console.log(error);
                    if(result.length>0)today=result[0].date;
                });  
                
                var style=fs.readFileSync(`contents/${title}_style`,'utf-8');                               
                db.query(`SELECT*FROM profile where id=${id}`,function(error,result){
                    if(error) console.log(error);
                    response.writeHead(200);
                    var contents=getProfile(result[0].level,result[0].major,result[0].minor,result[0].motto,strength,weakness,today);
                    response.end(templateHTML(title,style,contents));
                });
                                
            }
        }
        else if(title==='plan'){
            if(queryData.type==='form'){//파일 수정,삭제,추가
                if(queryData.add==='-1'){                
                    // fs.unlink(`contents/plan/${queryData.title}`,(err)=>{
                    //     response.writeHead(302,{Location:`/?id=${title}`});
                    //     response.end();
                    // });
                    db.query(`delete from plan where title='${queryData.title}'`,(err,result)=>{
                        if(err)console.log(err);
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

                // var filelist=fs.readdirSync('contents/plan')
      
                // var description="";
                // for(var i=0;i<filelist.length;i++){
                //     var data=fs.readFileSync(`contents/plan/${filelist[i]}`);
                //     description+=data;
                // } 
                var description="";
                db.query(`select *from plan left join period on plan.id=period.id where plan.id=${id}`,(err,result)=>{
                    var period="";
                    for(var i=0;i<result.length;i++){
                        description+=`<div class="grid3" style="border-bottom:1px solid black; font-size:20px;height:80px"  >
                    <span style="font-weight: bold;">${result[i].title}</span><span>${result[i].content}<a href="/?id=plan&type=form&title=${result[i].title}&add=-1" style="margin-left:10px;"><input type="button" method="post" value="delete" class="button"></a></span>
                </div>`;
                        period=result[i]._period;
                    }
                    var contents=getPlan(period,description);
                    response.end(templateHTML(title,style,contents)); 
                });   
                   
            
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
        console.log('add ininininin');
        var body='';
        request.on('data',(data)=>{
            body+=data;
        });
        request.on('end',()=>{
            var post=qs.parse(body);
            if(post._filename==='profile')manageFile(post,response);
            else if(post._filename==='plan'){
                if(post.add==='0'){//기간 업데이트
                    db.query(`insert into period(id,_period) values(${id},'${post.description}') on duplicate key update id=${id}, _period='${post.description}'`,(err)=>{
                        response.writeHead(302,{Location:'/?id=plan'});
                        response.end();                           
                    });                
                }
                else if(post.add==='1'){//할 일 추가
                    db.query(`insert into plan(id,title,content) values(${id},'${post.title}','${post.description}')`,(err)=>{
                        response.writeHead(302,{Location:'/?id=plan'});
                        response.end();                           
                    });
                }
            }
            else if(post._filename==='db_profile'){
                var level=post.level;

                db.query(`update profile set level='${level}', major='${post.major}', minor='${post.minor}' where id=1`,(err)=>{
                    if(err)console.log(err);
                    response.writeHead(302,{Location:'/?id=profile'});
                    response.end();  
                })
            }
            else if(post._filename==='profile_img'){
                console.log('profileimgimg');
            }
            else{//upload

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
