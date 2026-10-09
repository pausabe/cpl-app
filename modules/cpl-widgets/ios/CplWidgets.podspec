# The iOS half of the local module «CplWidgets» (modules/cpl-widgets): the app leaves the words of
# the days to come where the widgets of targets/widgets read them, and has them redrawn.
Pod::Spec.new do |s|
  s.name           = 'CplWidgets'
  s.version        = '1.0.0'
  s.summary        = 'The bridge between the CPL app and its home screen widgets'
  s.description    = 'Writes the payload of the widgets into the shared group of apps and reloads them'
  s.author         = 'cpl-app'
  s.homepage       = 'https://github.com/pausabe/cpl-app'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/pausabe/cpl-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'WidgetKit'

  s.source_files = '**/*.{h,m,swift}'
  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
