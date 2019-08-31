try {
  // 尝试加载localStorage项目，在屏幕上显示任何错误
  var loadedSectionss = JSON.parse(localStorage.getItem('sectionList')) || []
  var loadedList = JSON.parse(localStorage.getItem('websitesList'))
} catch (error) {
  document.getElementsByTagName('body').innerHTML = error.message
}
sectionss.add(loadedSectionss)
list.add(loadedList)
