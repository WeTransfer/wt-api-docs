# Unique header generation
require './lib/unique_head.rb'

# Markdown
set :markdown_engine, :redcarpet
set :markdown,
    fenced_code_blocks: true,
    smartypants: true,
    disable_indented_code_blocks: true,
    prettify: true,
    tables: true,
    with_toc_data: true,
    no_intra_emphasis: true,
    renderer: UniqueHeadCounter

# Assets
set :build_dir, 'docs'
set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :fonts_dir, 'fonts'

# Activate the syntax highlighter
activate :syntax
ready do
  require './lib/multilang.rb'
end

activate :sprockets

activate :autoprefixer do |config|
  config.browsers = ['last 2 version', 'Firefox ESR']
  config.cascade  = false
  config.inline   = true
end

class ZapContentLength < Struct.new(:app)
  def call(env)
    s, h, b = app.call(env)
    # The URL rewriters in Middleman do not update Content-Length correctly,
    # which makes Rack-Link flag the responses as having a wrong Content-Length.
    # For building assets this has zero importance because the Content-Length
    # header will be discarded - it is the server that recomputes it. But
    # it does prevent the site from building correctly.
    #
    # The fastest way out of this is to let Rack recompute the Content-Length
    # forcibly, for every response, at retrieval time.
    #
    # See https://github.com/rack/rack/issues/1472
    h.delete('Content-Length')
    [s, h, b]
  end
end

app.use ::Rack::ContentLength
app.use ZapContentLength

# Github pages require relative links
activate :relative_assets
set :relative_links, true

# Build Configuration
configure :build do
  # If you're having trouble with Middleman hanging, commenting
  # out the following two lines has been known to help
  activate :minify_css
  activate :minify_javascript
  # activate :relative_assets
  activate :asset_hash
  activate :gzip
  activate :asset_host, :host => '/documentation'
end

# Deploy Configuration
# If you want Middleman to listen on a different port, you can set that below
set :port, 4567

helpers do
  require './lib/toc_data.rb'
end
