import os

def update_shared_css():
    path = r'c:\50\OPG\css\shared.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update 100vh to 100dvh
    content = content.replace('min-height: 100vh;', 'min-height: 100dvh;')
    content = content.replace('height: 100vh;', 'height: 100dvh;')
    
    # 2. Add Mobile Media Queries
    # Ensure z-index is correct for sidebar overlay
    old_overlay = ".sidebar-overlay { position: fixed; inset: 0; z-index: 35; background: rgba(0,0,0,.4); opacity: 0; pointer-events: none; transition: opacity .3s; backdrop-filter: blur(2px); }"
    new_overlay = ".sidebar-overlay { position: fixed; inset: 0; z-index: 99; background: rgba(0,0,0,.6); opacity: 0; pointer-events: none; transition: opacity .3s; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }"
    
    if old_overlay in content:
        content = content.replace(old_overlay, new_overlay)
    
    old_mq = """@media (max-width: 900px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar-wrapper { position: fixed; transform: translateX(-100%); transition: transform 0.3s; width: 280px; padding: 16px; background: transparent; }"""
    
    new_mq = """@media (max-width: 900px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar-wrapper { position: fixed; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); width: 280px; padding: 16px; background: transparent; z-index: 100; }"""
    
    if old_mq in content:
        content = content.replace(old_mq, new_mq)
        
    mobile_css = """
@media (max-width: 768px) {
  .page-content { padding: 16px 12px; }
  .card { padding: 16px; }
  .topbar { padding: 0 16px; height: 60px; }
  .topbar-left { gap: 8px; }
  .topbar-right .universal-search-container { max-width: 150px; }
  .topbar-breadcrumb { font-size: 12px; }
  .modal-box { max-width: 95%; margin: 0 10px; }
  .modal-header { padding: 16px 20px; }
  .modal-body { padding: 20px; }
  .btn-gold, .btn-royal { font-size: 13px; padding: 10px 16px; }
  h1 { font-size: 24px !important; }
}
"""
    if "max-width: 768px" not in content:
        content += mobile_css
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_tree_html():
    path = r'c:\50\OPG\tree.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_div = '<div class="tree-wrapper anim anim-delay-1" id="treeContainer" style="overflow: auto;">'
    new_div = '<div class="tree-wrapper anim anim-delay-1" id="treeContainer" style="overflow: auto; -webkit-overflow-scrolling: touch;">'
    
    content = content.replace(old_div, new_div)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_dashboard_html():
    path = r'c:\50\OPG\dashboard.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Make feed cards cleaner on mobile
    old_mq = "       .ts-div { width: 1px; height: 40px; }\n    }"
    new_mq = """       .ts-div { width: 1px; height: 40px; }
    }
    @media (max-width: 768px) {
       .dash-welcome-header h1 { font-size: 24px; }
       .feed-card { padding: 16px; }
       .fc-actions { padding-left: 0; margin-top: 16px; }
       .fc-content { padding-left: 0; margin-top: 12px; }
       .dash-left-col, .dash-right-col { gap: 16px; }
       .tree-overview-card .btn-icon { display: none; }
       .tree-actions .btn-tree { padding: 6px 12px; font-size: 11px; }
       .fc-media { max-height: 200px; }
    }"""
    
    if "@media (max-width: 768px)" not in content:
        content = content.replace(old_mq, new_mq)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_shared_css()
update_tree_html()
update_dashboard_html()
print("Mobile optimizations applied successfully.")
