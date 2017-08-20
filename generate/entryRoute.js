'use strict'

<%modelsName.forEach((name)=>{ %>
let <%=name.toLocaleLowerCase()%>Routes = require('./<%=name.toLocaleLowerCase()%>Routes')
<%})%>

module.exports = function (app) {
  <%modelsName.forEach((name)=>{ %>
     <%=name.toLocaleLowerCase()%>Routes(app)
  <%})%>
  
}
