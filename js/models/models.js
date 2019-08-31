var URL = Backbone.Model.extend({
  defaults: {
    name: '',
    url: '',
    section: ''
  },

  validate: function(attrs) {
    var regex = /[$^()\[\]{}|<>]/g
    $('.successMsg').text('') // 删除成功消息
    if (attrs.name.length <= 1) {
      $('#ErrorName').text(' *名称必须长于一个字符. ')
      return '名称必须长于一个字符'
    }
    if (regex.test(attrs.name)) {
      $('#ErrorName').text(' *这些字符 $^()[]{}|<> 不允许用')
      return '这些字符 $^()[]{}|<> 不允许用'
    }
    $('#ErrorName').text('')
    if (attrs.url.length <= 1) {
      $('#errorUrl').text(' *网址URL必须长于一个字符.')
      return '网址URL必须长于一个字符'
    }
    if (regex.test(attrs.url)) {
      $('#errorUrl').text(' *这些字符 $^()[]{}|<> 不允许用')
      return '这些字符 $^()[]{}|<> is allowed'
    }
    $('#errorUrl').text('')
    $('#errorSection').text('')
  }
})

var section = Backbone.Model.extend({
  defaults: {
    name: ''
  },
  validate: function(attrs) {
    if (attrs.name.length <= 1) {
      $('#successMsgSection').text('')
      $('#SectionNameError').text(' *分类名称必须长于一个字符. ')
      return '分类名称必须长于一个字符'
    }
    $('#SectionNameError').text('')
  }
})
