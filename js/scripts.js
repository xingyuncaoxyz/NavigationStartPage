$(document).ready(function() {
  if (window.localStorage) {
    console.log('欢迎来到幸运草!')
  } else {
    document.body.innerHTML = '此页面需要你的浏览器开启localStorage才能正常运行，请激活它.'
    throw new Error('此页面需要你的浏览器开启localStorage才能正常运行，请激活它.')
  }
  $('form input').on('keypress', function(e) {
    return e.which !== 13; //输入表格时没有确认
});
  websitesView.startListeningEvents()
})
