"use strict";

const express = require('express');
const unirest = require('unirest');

const app = express();

const headEndReplacement =
    '<script src="http://assets.annotateit.org/annotator/v1.1.0/annotator-full.min.js"></script>' +
    '<link rel="stylesheet" href="http://assets.annotateit.org/annotator/v1.1.0/annotator.min.css">' +
    '</head>';

const bodyEndReplacement =
    '<script>' +
        'Annotator.Plugin&&(Annotator.Plugin.WCTS=function(e){return{pluginInit:function(){function e(e,n){if(n.referenceType){e.innerHTML="";var t=document.createElement("div");e.appendChild(t);var a=document.createElement("label");a.innerHTML="Reference Type: ",t.appendChild(a);for(var r=document.createElement("select"),l=1;l<=3;l++){var i=document.createElement("option");i.value="type"+l,i.text="Type "+l,r.add(i)}n.referenceType&&(r.value=n.referenceType),t.appendChild(r)}}this.annotator.viewer.addField({label:"Reference Type",load:e}),this.annotator.editor.addField({label:"Reference Type",load:e,submit:function(e,n){n.referenceType=e.getElementsByTagName("select")[0].value}})}}});' +
        'jQuery(function ($) {' +
            'let annotator = $(document.body).annotator().data("annotator");' +
            'annotator' +
            '    .addPlugin("Store", { prefix: "http://localhost:52629" })' +
            '    .addPlugin("Permissions", { user: "editor", permissions: { "admin": ["technicalUser"] }})' +
            '    .addPlugin("WCTS");' +
        '});' +
    '</script>' +
    '</body>';

app.get("/", (request, response) => {
    let getPromise = new Promise((resolve, reject) => {
        unirest
            .get(request.query.url)
            .end((wpResponse) => {
                if (wpResponse.ok) {
                    resolve(wpResponse.body);
                } else {
                    reject({"status": wpResponse.status, "body": wpResponse.body});
                }
            });
    });

    getPromise.then(body => {
        let fixedBody = body.replace("</head>", headEndReplacement)
            .replace("</body>", bodyEndReplacement);

        response.status(200).send(fixedBody);
    }, error => {
        response.status(error.status).send(error.body);
    });
});

app.listen(29136, function () {
    console.log("Annotation proxy service started...");
});