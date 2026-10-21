/* ============================================================================
   everMind Web — config.example.js
   Copie para `web/config.js` e preencha. Ver docs/SUPABASE_HANDOFF.md §6.

   • A chave "publishable" (ou "anon", em projetos antigos) é PÚBLICA por desenho:
     quem protege os dados é o RLS do banco. Pode ser commitada (o site é estático).
   • NUNCA coloque aqui a chave `service_role` / `secret`.
   • Sem este arquivo, o app funciona 100% local (comportamento atual).
   • Carregue-o no index.html ANTES dos scripts de sincronização.
   ========================================================================== */
window.EVERMIND_CONFIG = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseKey: 'SUA-CHAVE-PUBLISHABLE-OU-ANON',
};
