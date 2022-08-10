FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio: '0.7:0.15',
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
})

FilePond.parse(document.body);