var express=require("express");
var mysql=require("mysql2");
var fileuploader=require("express-fileupload");
var app=express();

app.listen(2093,function(){
    console.log("Server Started ");
})

app.use(express.static("public"));
app.use(fileuploader());
app.use(express.urlencoded(true));

app.get("/",function(req,resp){
    resp.sendFile(process.cwd()+"/public/index.html");
})
// app.get("/profile-donor", function (req, resp) {
//   resp.sendFile(process.cwd() + "/public/donor-profile.html");
// })



//=========DB Connectivity=========
var dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "triptiV@30",
    database: "project",
    dateStrings: true
  }
  
  var dbCon=mysql.createConnection(dbConfig);
  dbCon.connect(function (jasoos) {
    if (jasoos == null)
      console.log("Connected Successfullyyy!!!!!!");
    else 
      console.log(jasoos);
  })
  
//===========================================
app.get("/db-signup", function (req, resp) {
  //saving data in table
  //fixed                             
  //same seq. as in table
  dbCon.query("insert into users() values(?,?,?,current_date(),1)", [req.query.email, req.query.pwd, req.query.type], function (err) {
    if (err == null)
      resp.send("Record saved Successfully");
    else
      resp.send(err);
  })

})

//============================================
app.get("/db-login", function (req, resp) {
  dbCon.query("select * from users where email=? ", [req.query.email], function (err,table) {
    if(req.query.pwd!=table[0].password){
    resp.send("Wrong Password");
     return;
     }
    if (err != null)
      resp.send(err);
    else if (table.length == 1) {
      if (table[0].status == 1) {
        if (table[0].type == "Donor")
          resp.send("Donor Logined");
        else if (table[0].type == "Needy")
          resp.send("Needy Logined");
        else if(table[0].type == "Admin")
        resp.send("Admin Logined");
      }
      else if (table[0].status == 0) {
        resp.send("You Are Blocked");
      }
    }
    else
      resp.send("Invalid Email Id");
  });
});
//===================================================
app.get("/chk-email",function(req,resp){

  dbCon.query("select * from users where email=?",[req.query.email],function(err,resultTable){

   if(err==null)
   {
     if(resultTable.length==1)
       resp.send("Already Taken...");
      else if(req.query.email=="")
      resp.send("Please Enter Email-id");
     else
       resp.send("Available....!!!!");
     }
       else
     resp.send(err);

  })
})

//=================================================
app.post("/insert-donor-profile",function(req,resp)
{
  //--------------File Uploading-------------
  var fileName="nopic.jpg";
  if(req.files!=null)
  {
    //console.log(process.cwd());
    fileName=req.files.ppic.name;
    var path=process.cwd()+"/public/uploads/"+fileName;
    req.files.ppic.mv(path);
  }
  console.log(req.body);
  //resp.send("File Name="+fileName);
  
  //saving data in tables 
  var email=req.body.txtEmail;
  var name=req.body.txtName;
  var contact=req.body.txtContact;
  var address=req.body.txtAddress;
  var city=req.body.txtCity;
  var idproof=req.body.idproof;
  var from=req.body.txtfrom; 
  var to=req.body.txtto;
  var avail=from+"-"+to; 


  dbCon.query("insert into donors(email, name , mobile , address, city, idproof ,picname , avail) values(?,?,?,?,?,?,?,?)",[email,name,contact,address,city,idproof,fileName,avail],function(err){
    if(err==null)
    resp.send("Record Saved Successfulllyyyy!!!!");
    else
    resp.send(err);
  })
})
//========================================
app.post("/update-donor-profile",function(req,resp){
  var fileName;
  if(req.files!=null)
  {
    //console.log(process.cwd());
    fileName=email+"-"+req.files.ppic.name;
    var path=process.cwd()+"/public/uploads/"+fileName;
    req.files.ppic.mv(path,function(err){
      if(err)
      console.log(err);
      else
      console.log("File Uploaded");
    });
  }
  else
  fileName=req.body.hdn;

  var email=req.body.txtEmail;
  var name=req.body.txtName;
  var contact=req.body.txtContact;
  var address=req.body.txtAddress;
  var city=req.body.txtCity;
  var idproof=req.body.idproof;
  // var from=req.body.txtfrom; 
  // var to=req.body.txtto; 

  
  dbCon.query("update donors set name=(?), mobile=(?) , address=(?), city=(?),idproof=(?) ,picname=? where email=?",[name,contact,address,city,idproof,fileName,email],function(err){
    if(err==null)
    resp.send("updated Successfulllyyyy!!!!");
    else
    resp.send(err);
  });

});
//=========================================
app.get("/get-json-record",function(req,resp){

  console.log(req.query);
  var email=req.query.kuchEmail;

  dbCon.query("select * from donors where email=?",[email],function(err,resulttable){
    if(err)
    resp.send(err);
    else
    resp.send(resulttable);
  })
})

//=============================================

app.get("/avail-process",function(req,resp)
{
     //saving data in table
     
    console.log("heyyy");
    
         //fixed                             //same seq. as in table
    dbCon.query("insert into medavail (email,medName,expdate,packing,qty) values(?,?,?,?,?)",[req.query.kuchEmail,req.query.kuchMedName,req.query.kuchExp,req.query.kuchPack,req.query.kuchQty],function(err)
    {
        if(err==null)
        resp.send("Medicine Availed");
        else
        resp.send(err);
      })

})
//===========================================================
app.get("/change-s-password",function(req,resp){

  var email=req.query.pEmail;
  var oldpass=req.query.oldpass;
  var newpass=req.query.newpass;

  var data =[email,oldpass];
  var data1=[newpass,email];
  console.log(req.query);
  dbCon.query("select * from users where email=? and password=?", data, function(err,table){
    if(err!=null)
    resp.send(err.toString());
    else if(table.length==1){
      if(newpass){
        if(table[0].type=="Donor"){
          dbCon.query("update users set password=? where email=? ",data1, function(err,result){
            if(err!=null)
            resp.send(err);
            else
            resp.send("Change Password successfully");
          });

        }
        else {
          resp.send("U R Not Donor");
        }
      }
      else
      {
        resp.send("Fill New Password");
      }
    }
    else 
    resp.send("INVALID ID");
  })

}) ;

//====================================
app.post("/insert-needy-profile",function(req,resp)
{
  //--------------File Uploading-------------
  var fileName="nopic.jpg";
  if(req.files!=null)
  {
    //console.log(process.cwd());
    fileName=req.files.ppic.name;
    var path=process.cwd()+"/public/uploads/"+fileName;
    req.files.ppic.mv(path);
  }
  //console.log(req.body);
  //resp.send("File Name="+fileName);
  
  //saving data in tables 
  var email=req.body.txtEmail;
  var name=req.body.txtName;
  var contact=req.body.txtContact;
  var dob=req.body.txtdob;
  var gender=req.body.txtGender;
  var city=req.body.txtCity;
  var address=req.body.txtAddress;


  dbCon.query("insert into needy(email, name , mobile ,dob,gender, city,address,picname) values(?,?,?,?,?,?,?,?)",[email,name,contact,dob,gender,city,address,fileName],function(err){
    if(err==null)
    resp.send("Record Saved Successfulllyyyy!!!!");
    else
    resp.send(err);
  })
})
//-----------------------------------------------------------------------
app.get("/get-needy-profile-record", function (req, resp) {
  // console.log("ll")
  dbCon.query("select * from needy where email=?", [req.query.kuchEmail], function (err, resultTableJSON) {
    if (err == null) {
      resp.send(resultTableJSON);
    }
    else
      resp.send(err);
  })
})

//-----------------------------------------------------------------------
app.post("/update-needy-profile",function(req,resp){
  var fileName;
  if(req.files!=null)
  {
    //console.log(process.cwd());
    fileName=email+"-"+req.files.ppic.name;
    var path=process.cwd()+"/public/uploads/"+fileName;
    req.files.ppic.mv(path,function(err){
      if(err)
      console.log(err);
      else
      console.log("File Uploaded");
    });
  }
  else
  fileName=req.body.hdn;

  var email=req.body.txtEmail;
  var name=req.body.txtName;
  var contact=req.body.txtContact;
  var dob=req.body.txtdob;
  var gender=req.body.txtGender;
  var city=req.body.txtCity;      
  var address=req.body.txtAddress;

  dbCon.query("update needy set name=?, mobile=? ,dob=?,gender=?,city=?, address=?,picname=? where email=?",[name,contact,dob,gender,city,address,fileName,email],function(err){
    if(err==null)
    resp.send("updated Successfulllyyyy!!!!");
    else
    resp.send(err);
  });
});

//=========================================================
app.get("/get-city-donor",function(req,resp){
  dbCon.query("select distinct city from donors",function(err,records){
    if(err==null)
    {
      resp.send(records);
    }
    else console.log(toString(err));
})
});
//===================================================
app.get("/get-medname-donor",function(req,resp){
  dbCon.query("select distinct medName from medavail",function(err,records){
    if(err==null)
    {
      resp.send(records);
    }
    else console.log(toString(err));
})
});
app.get("/fetchusr",function(req,resp){
  console.log(req.query);
  dbCon.query("select * from medavail inner join donors on medavail.email =donors.email where donors.city=? and medavail.medName=?",[req.query.city,req.query.med],function(err,result){
    if(err==null)
    {
      if(result.length>0)
      {
        resp.send(result);
      }
      else
      {
        resp.send("No data found");
      }
    }
    else
    {
      console.log(err);
      resp.send(err);
    }
  }) 
})

//=================================================
app.get("/get-user-records-findmed",function(req,resp){
dbCon.query("select * from donors where email=?",[req.query.emailkuch],function(err,resultTable){
  if(err==null)
  {
    resp.send(resultTable);
  }
  else
  resp.send(err);
})
})
//===============================================
app.get("/admin",function(req,resp){
  resp.sendFile(process.cwd()+"/public/dash-admin.html");
})
//===============================================

app.get("/get-user-records",function(req,resp)
{
         //fixed                             //same seq. as in table
    dbCon.query("select * from users",function(err,resultTableJSON)
    {
          if(err==null)
            resp.send(resultTableJSON);
              else
            resp.send(err);
    })
})
//====================================================
app.get("/donor-availmed-records-new",function(req,resp)
{
         //fixed                             //same seq. as in table
         console.log(req.query.emailKuch)
  dbCon.query("select * from medavail where email=?",[req.query.emailKuch],function(err,resulttableJSON){
            resp.send(resulttableJSON);
    })
}) 
// =====================================================================
app.get("/donor-availmed-delete",function(req,resp)
{
     //saving data in table
    var email=req.query.emailkuch;
    

         //fixed                             //same seq. as in table
    dbCon.query("delete from medavail where sr=? ",[email],function(err,result)
    {
          if(err==null)
          {
            if(result.affectedRows==1)
              resp.send("Account Removed Successssfullllyyyyyyyyyyyyyyyyyyyyyyyy!!!!!!!!!");
            else
              resp.send("Invalid Email id");
            }
              else
            resp.send(err);
    })
}) 
//==============================================

//===========================================================
app.get("/get-needy-records",function(req,resp)
{
         //fixed                             //same seq. as in table
    dbCon.query("select * from needy",function(err,resultTableJSON)
    {
          if(err==null)
            resp.send(resultTableJSON);
              else
            resp.send(err);
    })
})
//===============================================================
app.get("/do-needy-delete",function(req,resp) 
{
     //saving data in table
    var email=req.query.emailkuch;
    

         //fixed                             //same seq. as in table
    dbCon.query("delete from needy where email=?",[email],function(err,result)
    {
          if(err==null)
          {
            if(result.affectedRows==1)
              resp.send("Account Removed Successssfullllyyyyyyyyyyyyyyyyyyyyyyyy!!!!!!!!!");
            else
              resp.send("Inavlid Email id");
            }
              else
            resp.send(err);
    })
})

//====================================================
app.get("/get-donors-records",function(req,resp)
{
         //fixed                             //same seq. as in table
    dbCon.query("select * from donors",function(err,resultTableJSON)
    {
          if(err==null)
            resp.send(resultTableJSON);
              else
            resp.send(err);
    })
})

//========================================================

app.get("/do-donor-delete",function(req,resp)
{
     //saving data in table
    var email=req.query.emailkuch;
    

         //fixed                             //same seq. as in table
    dbCon.query("delete from donors where email=?",[email],function(err,result)
    {
          if(err==null)
          {
            if(result.affectedRows==1)
              resp.send("Account Removed Successssfullllyyyyyyyyyyyyyyyyyyyyyyyy!!!!!!!!!");
            else
              resp.send("Inavlid Email id");
            }
              else
            resp.send(err);
    })
})
//===================================
app.get("/do-angular-block",function(req,resp){

  var email=req.query.emailkuch;
  dbCon.query("update users set status=0 where email=?",[email],function(err,result)
  {
    if(err==null)
          {
            if(result.affectedRows==1)
              resp.send("Account Blocked");
          }
              else
            resp.send(err);
  })
})
//=============================================
app.get("/do-angular-resume",function(req,resp){

  var email=req.query.emailkuch;
  dbCon.query("update users set status=1 where email=?",[email],function(err,result)
  {
    if(err==null)
          { 
            if(result.affectedRows==1)
              resp.send("Account Resume");
          }
              else
            resp.send(err);
  })
})

//====================================================
//====================================================

app.get("/get-availmed-records",function(req,resp)
{
         //fixed                             //same seq. as in table
    dbCon.query("select * from medavail",function(err,resultTableJSON) 
    {
          if(err==null)
            resp.send(resultTableJSON);
              else
            resp.send(err);
    })
})   
//=====================================================
//=====================================================
app.get("/do-availmed-delete",function(req,resp)
{
     //saving data in table
    var email=req.query.emailkuch;
    

         //fixed                             //same seq. as in table
    dbCon.query("delete from medavail where expdate<current_date()",function(err,result)
    {
          if(err==null)
          {
            if(result.affectedRows==1)
              resp.send("");
            else
              resp.send("Inavlid Email id");
            }
              else
            resp.send(err);
    })
})//*check againnnnnnn%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%/


//=================================================
app.get("/get-user-records-findmed",function(req,resp){
  dbCon.query("select * from donors where email=?",[req.query.emailkuch],function(err,resultTable){
    if(err==null)
    {
      resp.send(resultTable);
    }
    else
    resp.send(err);
  })
  })