var vistaURL = Backbone.View.extend({
  model: new URL(),
  tagName: 'div',
  className: 'url',
  initialize: function() {
    this.template = _.template($('#UrlTemplate').html())
    this.editionForm = _.template($('#editionForm').html())
  },

  events: {
    'mouseenter .wrapperUrl': 'showModifiyIcons',
    'mouseleave .wrapperUrl': 'hideModifiyIcons',
    'click .editSite': 'edit',
    'dblclick .deleteSite': 'delete'

  },
  // Show edit and delete glyphicons
  showModifiyIcons: function() {
    this.$el.find('.editSite').show()
    this.$el.find('.deleteSite').show()
  },
  // Hide edit and delete glyphicons
  hideModifiyIcons: function() {
    this.$el.find('.editSite').hide()
    this.$el.find('.deleteSite').hide()
  },

  edit: function() {
    var self = this
    $('#AddUrlForm fieldset').attr('disabled', 'true')
    // Trigger a click event to close already opened forms
    $('.closeEdit').click()
    this.$el.html(this.editionForm(this.model.toJSON()))
    for (var i = 0; i < sectionss.length; i++) {
      $('#editSections').append(`<option val="${sectionss.at(i).get('name')}">${sectionss.at(i).get('name')}</option>`)
    }
    $('#editSections').val(this.model.get('section'))

    $('.editModel').click(function() {
      self.model.set({
        name: $('.editName').val(),
        url: $('.editURL').val(),
        section: $('#editSections').val()
      })
      self.render()
      $('#AddUrlForm fieldset').removeAttr('disabled')
      localStorage.setItem('websitesList', JSON.stringify(list))
    })

    // Pressing the button close renders the element again
    $('.closeEdit').click(function() {
      self.render()
      $('#AddUrlForm fieldset').removeAttr('disabled')
    })
  },

  delete: function() {
    list.remove([this.model])
    localStorage.setItem('websitesList', JSON.stringify(list))
    AddFormView.render()
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  }

})

var UrlListView = Backbone.View.extend({
  model: list,
  el: $('.UrlList'),
  initialize: function() {
    var self = this
  },

// This prevent firing a change event (and therefore a call to render)
//for each site loaded
  startListeningEvents: function() {
    this.render()
    this.model.on('add', this.render, this)
    this.model.on('remove', this.render, this)
    this.model.on('change', this.render, this)
  },

  render: function() {
    var self = this
    this.$el.html('')
    var counter = 0
    _.each(_.sortBy(this.model.toArray(), function(element) {
      return element.get('section')
    }), function(site) {
      var siteSection = site.get('section')
      var sectionFound = sectionss.findWhere({
        name: siteSection
      })
      if (sectionFound) {
        var sectionCID = sectionFound.cid
      }
      if ($('#' + sectionCID).length > 0) {
        // 如果该分类已存在，请将新网站附加到该分类
        $('#' + sectionCID).append(new vistaURL({
          model: site
        }).render().$el)
      } else {
        if (counter == 0 || counter % 4 == 0) {
          // Add 4 columns to ech row (4x3 = 12(desired number)) 向ech行添加4列（4x3 = 12（所需数量))
          self.$el.append('<div class="row"></div>')
        }
        // 如果没有，请在末尾添加相应的分类，然后将模型(model)附加到其中
        $('.row:last-child').append(`<div class="col-sm-3"><div class="box" id="${sectionCID}"><h3>${site.get('section')}</h3></div></div>`)
        counter += 1
        $('#' + sectionCID).append(new vistaURL({
          model: site
        }).render().$el)
      }
    })
    return this
  }
})

var websitesView = new UrlListView()

var AddForm = Backbone.View.extend({
  model: list,
  el: $('.addFormRendered'),
  initialize: function() {
    this.template = _.template($('#addFormTemplate').html())
    this.render()
  },
  events: {
    'click .saveUrl': 'saveSite',
    'click .addSite': 'checkForEmptySectionList',
    'focus #url': 'addHttpsText',
    'click .deleteAllSites': 'deleteAllSites',
    'click .downloadSites': 'downloadSites',
    'click .uploadFile': 'uploadFile',
    'change #fileElem': 'readSingleFile'
  },

  checkForEmptySectionList: function(event) {
    event.stopPropagation()
    if (sectionss.length < 1) {
      $('.SectionEmptyWarning').text(' *请添加至少一个分类以开始添加网址.')
      $('#AddSectionModal').modal('toggle')
    } else {
      $('#AddWebsiteModal').modal('toggle')
    }
    this.cleanAddUrlForm()
  },

  downloadSites: function() {
    if (this.model.length != 0) {
      var SitesAndSectionsJSONBackup = {
        sites: this.model,
        sections: sectionss
      }
      var backupList = JSON.stringify(SitesAndSectionsJSONBackup)
      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(backupList)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'sitesBackup.txt'
      hiddenElement.click()
    } else {
      $('#errorTitle').text('没有要备份的网址')
      $('#errorText').text('你不能创建空列表的备份.')
      $('#errorModal').modal('toggle')
    }
  },

  deleteAllSites: function() {
    this.model.reset()
    sectionss.reset()
    websitesView.render()
    sectionFormView.render()
    sectionFormView.cleanMessages()
    localStorage.removeItem('websitesList')
    localStorage.removeItem('sectionList')
  },

  uploadFile: function() {
    var el = document.getElementById('fileElem')
    if (el) {
      el.click()
    }
  },

  readSingleFile: function(evt) {
    var f = evt.target.files[0]
    var self = this
    if (f) {
      var r = new FileReader()
      r.onload = function(e) {
        var contents = e.target.result
        if (f.type == 'text/plain' && self.model.length == 0) {
          var SitesAndSectionsJSONBackup = JSON.parse(contents)
          var sitesBackup = SitesAndSectionsJSONBackup.sites
          var sectionsBackup = SitesAndSectionsJSONBackup.sections
          self.model.add(sitesBackup)
          sectionss.add(sectionsBackup)
          localStorage.setItem('websitesList', JSON.stringify(self.model))
          localStorage.setItem('sectionList', JSON.stringify(sectionsBackup))
          sectionFormView.render()
          websitesView.render()
        } else {
          $('#errorTitle').text('文件错误')
          $('#errorText').text('请在上传已保存的网址文件之前删除所有网址，并确保上传的文件是备份文件.')
          $('#errorModal').modal('toggle')
        }
      }
      r.readAsText(f)
      $('#fileForm').get(0).reset() // Reset the form so if a file with the same name is uploaded it stills triggers a change event
    } else {
      $('#errorTitle').text('无法加载文件')
      $('#errorText').text('打开文件时出错.')
      $('#errorModal').modal('toggle')
    }
  },

  render: function() {
    this.$el.html('')
    this.$el.html(this.template(this.model.toJSON()))
    for (var i = 0; i < sectionss.length; i++) {
      $('#sections').append(`<option>${sectionss.at(i).get('name')}</option>`)
    }
  },

  cleanAddUrlForm: function() {
    $('#AddUrlForm fieldset').removeAttr('disabled')
    $('#ErrorName').text('')
    $('#name').val('')
    $('#url').val('')
    $('#errorUrl').text('')
    $('.successMsg').text('')
  },

  addHttpsText: function(e) {
    if ($(e.currentTarget).val() == '') {
      $(e.currentTarget).val('https://heiban.me/')
    }
  },

  saveSite: function() {
    var self = this
    var name = $('#name').val()
    var url = $('#url').val()
    var section = $('#sections').val()
    var newUrl = new URL()
    newUrl.set({
      name: name,
      url: url,
      section: section
    })
    if (newUrl.isValid()) {
      self.model.add(newUrl)
      $('#name').val('')
      $('#url').val('')
      localStorage.setItem('websitesList', JSON.stringify(list))
      $('.successMsg').text(' *你的网址已添加')
    }
  }
})
var AddFormView = new AddForm()

var sectionView = Backbone.View.extend({
  model: new section(),
  tagName: 'div',
  className: 'section',
  initialize: function() {
    this.template = _.template($('#AddSectionTemplate').html())
    this.editForm = _.template($('#sectionEditionForm').html())
  },

  events: {
    'mouseenter .wrapperSection': 'showModifiyIcons',
    'mouseleave .wrapperSection': 'hideModifiyIcons',
    'click .editSection': 'edit',
    'dblclick .deleteSection': 'delete',
    'click .closeSectionEdit': 'restoreSectionModal',
    'click .editSectionModel': 'saveSection'

  },
  showModifiyIcons: function() {
    this.$el.find('.editSection').show()
    this.$el.find('.deleteSection').show()
  },
  hideModifiyIcons: function() {
    this.$el.find('.editSection').hide()
    this.$el.find('.deleteSection').hide()
  },

  restoreSectionModal: function() {
    $('#sectionName').prop("disabled", false)
    this.render()
  },

  updateSiteListSections: function(OldSectionName, newSectionName) {
    for (var i = 0; i < list.length; i++) {
      if (list.at(i).get('section') == OldSectionName) {
        list.at(i).set({
          section: newSectionName
        })
      }
    }
  },

  saveSection: function() {
    var oldSectionName = this.model.get('name')
    var newSectionName = $('#EditFormName').val()
    var newSection = new section()
    newSection.set({
      name: newSectionName
    })
    if (newSection.isValid()) {
      this.model.set({
        name: newSectionName,
      })
      $('#successMsgSection').text('分类名称已更改!')
      if (list.length > 0) {
        this.updateSiteListSections(oldSectionName, newSectionName)
        localStorage.setItem('websitesList', JSON.stringify(list))
      }
      localStorage.setItem('sectionList', JSON.stringify(sectionss))
    }
    AddFormView.render()
    this.restoreSectionModal()
  },

  edit: function() {
    $('#sectionName').prop("disabled", true)
    this.$el.html(this.editForm(this.model.toJSON()))
  },

  removeSitesWithSection(section) {
    var sitesToDelete = []
    for (var i = 0; i < list.length; i++) {
      if (list.at(i).get('section') == section) {
        sitesToDelete.unshift(list.at(i))
      }
    }
    list.remove(sitesToDelete)
  },

  delete: function() {
    sectionss.remove([this.model])
    this.cleanSectionFormMessages()
    this.removeSitesWithSection(this.model.get('name'))
    localStorage.setItem('sectionList', JSON.stringify(sectionss))
    localStorage.setItem('websitesList', JSON.stringify(list))
    AddFormView.render()
    sectionFormView.render()
  },

  cleanSectionFormMessages: function() {
    $('.SectionNameError').text('')
    $('.SectionEmptyWarning').text('')
    $('#successMsgSection').text('')
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  }
})

var sectionForm = Backbone.View.extend({
  model: sectionss,
  el: $('#AddSectionModal'),
  initialize: function() {
    this.render()
  },

  events: {
    'click .addSection': 'saveSection',
    'click #AddSectionModal': 'render'
  },

  saveSection: function() {
    var sectionName = $('#sectionName').val()
    var newSection = new section()
    newSection.set({
      name: sectionName
    })
    if (newSection.isValid()) {
      this.model.add([newSection])
      $('#successMsgSection').text('已添加分类!')
      $('#sectionName').val('')
      $('.SectionEmptyWarning').text('')
      localStorage.setItem('sectionList', JSON.stringify(sectionss))
      this.render()
      AddFormView.render()
    }
  },

  cleanMessages: function() {
    $('#successMsgSection').text('')
    $('#sectionName').val('')
    $('.SectionEmptyWarning').text('')
  },

  render: function() {
    $('#renderedSections').html('')
    _.each(this.model.toArray(), function(element) {
      var renderedSection = new sectionView({
        model: element
      }).render().$el
      $('#renderedSections').append(renderedSection)
    })
    return this
  }
})

var sectionFormView = new sectionForm()
