#!/usr/bin/env python3
"""The site's icon set: simple line pictograms, 24 by 24, drawn once here and
placed on every page as an inline sprite between <!--ICONS--> and <!--/ICONS-->.
A page uses one with:  <svg class="ic" aria-hidden="true"><use href="#ic-name"/></svg>

Run from the repo root to refresh the sprite on every page:
  python3 scripts/icons.py
"""
import pathlib, re

ICONS = {
    # sections and principles
    "target":    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v2"/><path d="M3 12h18"/>',
    "circle-check": '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    "hash":      '<path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16"/>',
    "compass":   '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    "shield":    '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    "file":      '<path d="M14 3H7a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    "layers":    '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>',
    "flask":     '<path d="M9 3h6"/><path d="M10 3v6l-5 9a1.5 1.5 0 001.3 2.2h11.4A1.5 1.5 0 0019 18l-5-9V3"/><path d="M7.5 15h9"/>',
    "box":       '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/>',
    "funnel":    '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    "chart":     '<path d="M4 20h16"/><path d="M7 16v-5M12 16V7M17 16v-9"/>',
    "cpu":       '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 10h4v4h-4z"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M7 4v3M17 4v3M7 17v3M17 17v3"/>',
    "database":  '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    "grid":      '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    "award":     '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
    "mail":      '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    "chevron":   '<path d="M6 9l6 6 6-6"/>',
    "check":     '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    # built page
    "puzzle":    '<path d="M10 4a2 2 0 014 0v1h3a1 1 0 011 1v3h1a2 2 0 010 4h-1v3a1 1 0 01-1 1h-3v1a2 2 0 01-4 0v-1H7a1 1 0 01-1-1v-3H5a2 2 0 010-4h1V6a1 1 0 011-1h3z"/>',
    "folder":    '<path d="M3 7a1 1 0 011-1h5l2 2h9a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>',
    "wrench":    '<path d="M14.5 4.5a5 5 0 00-5.5 6.8L4 16.3V20h3.7l5-5a5 5 0 006.8-5.5l-3 3-3-3z"/>',
    "calendar":  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "clipboard": '<rect x="6" y="5" width="12" height="16" rx="1.5"/><path d="M9 5a1.5 1.5 0 013 0h0a1.5 1.5 0 013 0"/><path d="M9 14l2 2 4-4"/>',
    "message":   '<path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4z"/>',
    "code":      '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    "server":    '<rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/>',
    "phone":     '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17h2"/>',
    "hand":      '<path d="M8 13V6a1.5 1.5 0 013 0v6M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v8a6 6 0 01-6 6h-1a6 6 0 01-5.4-3.4L3.3 12a1.5 1.5 0 012.5-1.6L8 13"/>',
    "stop":      '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    "table":     '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M9 10v9M15 10v9"/>',
    "ticket":    '<path d="M4 8a2 2 0 002 2 2 2 0 010 4 2 2 0 00-2 2v2h16v-2a2 2 0 01-2-2 2 2 0 010-4 2 2 0 002-2V6H4z"/><path d="M12 6v12"/>',
    "bulb":      '<path d="M9 18h6M10 21h4"/><path d="M8 13a5 5 0 118 0c-1 1-1.5 2-1.5 3h-5c0-1-.5-2-1.5-3z"/>',
    "list":      '<path d="M9 7h11M9 12h11M9 17h11"/><path d="M4 7l1 1 2-2M4 12l1 1 2-2M4 17l1 1 2-2"/>',
    "book":      '<path d="M4 5a2 2 0 012-2h5v17H6a2 2 0 01-2-2z"/><path d="M20 5a2 2 0 00-2-2h-5v17h5a2 2 0 002-2z"/>',
    "stairs":    '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
    # operator and models
    "user":      '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>',
    "star":      '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
    "users":     '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M21.5 20c0-3-2-4.8-4.5-5.3"/>',
    "link":      '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    # knowledge page
    "wave":      '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
    "sprout":    '<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 10c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5z"/>',
    "repeat":    '<path d="M17 3l3 3-3 3"/><path d="M20 6H8a4 4 0 00-4 4v1"/><path d="M7 21l-3-3 3-3"/><path d="M4 18h12a4 4 0 004-4v-1"/>',
}

def sprite():
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">']
    for name, body in ICONS.items():
        out.append(f'<symbol id="ic-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{body}</symbol>')
    out.append("</svg>")
    return "\n".join(out)

def use(name, cls="ic"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#ic-{name}"/></svg>'

PAGES = ["index.html", "built.html", "aiwork.html", "scorecard.html", "casefiles.html", "operator.html", "models.html", "knowledge.html", "chapters.html"]

if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent.parent
    for page in PAGES:
        p = root / page
        if not p.exists(): continue
        s = p.read_text(encoding="utf-8")
        block = "<!--ICONS-->\n" + sprite() + "\n<!--/ICONS-->"
        if "<!--ICONS-->" in s:
            s = re.sub(r"<!--ICONS-->.*?<!--/ICONS-->", lambda m: block, s, flags=re.S)
        else:
            s = s.replace("<body>\n", "<body>\n" + block + "\n", 1)
        p.write_text(s, encoding="utf-8")
        print(page, "sprite written")
