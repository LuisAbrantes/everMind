/* ============================================================================
   everMind Web — js/core/storage.js
   Portagem 1:1 de `src/modules/storage/*` do projeto React Native.

   ┌─ Interface original ────────────────────────────────────────────────────┐
   │  IStorageGateway                                                     │
   │    get<T>(key): T | null                                             │
   │    set<T>(key, value): void                                          │
   │    remove(key): void                                                 │
   │    clear(): void                                                     │
   │                                                                       │
   │  Observação importante da análise: apesar das assinaturas permitirem    │
   │  Promise, TODAS as implementações de produção são 100% síncronas e     │
   │  todos os coordenadores as tratam como síncronas. Mantemos síncrono.    │
   └───────────────────────────────────────────────────────────────────────┘

   ┌─ Adaptação web ───────────────────────────────────────────────────────┐
   │  O `MMKVStorageGateway` original fazia `require('react-native-mmkv')` │
   │  dentro de um try/catch. Essa dependência NÃO está no package.json,   │
   │  então o app real caía sempre no `Map` em memória e perdia tudo ao    │
   │  recarregar. Numa PWA isso seria inaceitável, então o fallback passa   │
   │  a ser `localStorage` — mesma API síncrona, mesmas chaves, mesmo       │
   │  formato JSON. Nenhum coordenador precisou ser alterado.              │
   └───────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** Chave de progresso global, compartilhada por 4 módulos do app. */
  var STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

  /* ------------------------------------------------------------------------
     Base comum: serialização e leitura idênticas às do React Native.
     Regra original preservada: `if (!raw) return null` — portanto uma string
     vazia, "0", "false" ou "null" gravada no storage é lida como null.
     ---------------------------------------------------------------------- */
  function parse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function serialize(value) {
    return JSON.stringify(value);
  }

  /* =========================================================================
     InMemoryStorageGateway — portagem de InMemoryStorageGateway.ts
     Mantido para testes e para o modo "sessão privada".
     ======================================================================= */
  function InMemoryStorageGateway() {
    this._map = new Map();
    this.name = 'memory';
  }

  InMemoryStorageGateway.prototype.get = function (key) {
    return parse(this._map.get(key));
  };

  InMemoryStorageGateway.prototype.set = function (key, value) {
    this._map.set(key, serialize(value));
  };

  InMemoryStorageGateway.prototype.remove = function (key) {
    this._map.delete(key);
  };

  InMemoryStorageGateway.prototype.clear = function () {
    this._map.clear();
  };

  /* =========================================================================
     LocalStorageGateway — substituto web do MMKVStorageGateway
     Mantém o fallback interno em memória caso o localStorage seja bloqueado
     (modo privado do Safari, cookies desativados, iframe sem permissão...).
     ======================================================================= */
  function LocalStorageGateway(namespace) {
    this.name = 'localStorage';
    this._prefix = namespace || 'evermind';
    this._fallback = new Map();
    this.corruptKeys = [];
    this._available = LocalStorageGateway.isAvailable();
  }

  LocalStorageGateway.isAvailable = function () {
    try {
      var probe = '__evermind_probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  };

  LocalStorageGateway.prototype._key = function (key) {
    return this._prefix + ':' + key;
  };

  /** Leitura crua (string) — sem parse, sem efeitos colaterais. */
  LocalStorageGateway.prototype.getRaw = function (key) {
    if (!this._available) {
      var mem = this._fallback.get(key);
      return mem == null ? null : mem;
    }
    try {
      return global.localStorage.getItem(this._key(key));
    } catch (error) {
      return null;
    }
  };

  LocalStorageGateway.prototype.get = function (key) {
    var raw = this.getRaw(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      // Dado ilegível: NUNCA sobrescrevemos em silêncio. Guardamos uma cópia
      // (`<chave>_backup`) e avisamos com delicadeza (veja consumeNotices).
      this.quarantine(key, raw);
      return null;
    }
  };

  /**
   * Guarda uma cópia do valor atual de `key` em `<key>_backup` (a primeira
   * cópia nunca é sobrescrita; as seguintes vão para `<key>_backup_2`) e
   * remove a chave original para que um novo estado limpo possa ser gravado.
   * Registra um aviso para a interface.
   */
  LocalStorageGateway.prototype.quarantine = function (key, rawValue) {
    var raw = rawValue != null ? rawValue : this.getRaw(key);
    if (raw == null || raw === '') return;
    var slot = key + '_backup';
    if (this.getRaw(slot)) slot = key + '_backup_2';
    this._writeRaw(slot, raw);
    this.remove(key);
    if (this.corruptKeys.indexOf(key) < 0) this.corruptKeys.push(key);
  };

  /** Devolve (e limpa) as chaves que foram postas em quarentena. */
  LocalStorageGateway.prototype.consumeNotices = function () {
    var out = this.corruptKeys.slice();
    this.corruptKeys.length = 0;
    return out;
  };

  LocalStorageGateway.prototype._writeRaw = function (key, raw) {
    if (!this._available) {
      this._fallback.set(key, raw);
      return;
    }
    try {
      global.localStorage.setItem(this._key(key), raw);
    } catch (error) {
      this._fallback.set(key, raw);
    }
  };

  LocalStorageGateway.prototype.set = function (key, value) {
    // Cota estourada ou modo privado: `_writeRaw` degrada para memória sem
    // quebrar a UX.
    this._writeRaw(key, serialize(value));
  };

  LocalStorageGateway.prototype.remove = function (key) {
    this._fallback.delete(key);
    if (!this._available) return;
    try {
      global.localStorage.removeItem(this._key(key));
    } catch (error) {
      /* noop */
    }
  };

  LocalStorageGateway.prototype.clear = function () {
    this._fallback.clear();
    if (!this._available) return;
    try {
      var prefix = this._prefix + ':';
      var doomed = [];
      for (var i = 0; i < global.localStorage.length; i++) {
        var k = global.localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) doomed.push(k);
      }
      for (var j = 0; j < doomed.length; j++) global.localStorage.removeItem(doomed[j]);
    } catch (error) {
      /* noop */
    }
  };

  /* =========================================================================
     Instância única usada por toda a aplicação.
     ======================================================================= */
  var storage = new LocalStorageGateway('evermind');

  EM.storage = {
    STORAGE_KEY_USER_PROGRESS: STORAGE_KEY_USER_PROGRESS,
    gateway: storage,
    LocalStorageGateway: LocalStorageGateway,
    InMemoryStorageGateway: InMemoryStorageGateway,
  };
})(window);
