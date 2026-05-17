<template>
  <footer>
    <div class="footer-top">
      <div class="footer-brand">
        <NuxtLink to="/" class="logo">
          <span class="logo-mark" />
          CORINO
        </NuxtLink>
        <p>Two plugins, made carefully, by people who still mix records. Based in Oslo, Norway.</p>
        <div class="footer-email">
          <span class="flag" aria-label="Norway" role="img">🇳🇴</span>
          hello@corino.audio
        </div>
      </div>
      <div class="footer-col">
        <h4>Plugins</h4>
        <ul>
          <li><NuxtLink to="/#plugins">HALO Saturator</NuxtLink></li>
          <li><NuxtLink to="/#plugins">DRIFT Granular</NuxtLink></li>
          <li><NuxtLink to="/#bundle">Studio Bundle</NuxtLink></li>
          <li><a href="#">Sound Packs</a></li>
          <li><a href="#">Free Trials</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <ul>
          <li><a href="#">Manuals</a></li>
          <li><a href="#">Tutorials</a></li>
          <li><a href="#">Preset Library</a></li>
          <li><a href="#">Changelog</a></li>
          <li><a href="#">Status</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Journal</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Moonbase AS</span>
      <span>VST3 · AU · AAX · macOS · WIN · APPLE SILICON NATIVE</span>
      <span>v2.1.04 · BUILD 2026.05</span>
    </div>
  </footer>
</template>
