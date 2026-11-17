// Store settings + CMS content (draft / published with basic revision history)
import http, { USE_MOCK } from './http';
import { db, delay, audit } from './mockDb';

const mock = {
  getSettings: () => delay(db.get('settings'), 50),
  updateSettings: (data, actor) => {
    const s = db.set('settings', { ...db.get('settings'), ...data });
    audit(actor, 'update', 'settings', '-', Object.keys(data).join(', '));
    return delay(s);
  },
  getCms: () => delay(db.get('cms').published, 50),
  getCmsAdmin: () => delay(db.get('cms')),
  saveDraft: (draft, actor) => {
    const cms = db.get('cms');
    return delay(db.set('cms', { ...cms, draft, draftSavedAt: new Date().toISOString(), updatedBy: actor }));
  },
  publish: (draft, actor) => {
    const cms = db.get('cms');
    const revisions = [{ at: new Date().toISOString(), by: actor, content: cms.published }, ...(cms.revisions || [])].slice(0, 5);
    audit(actor, 'publish', 'cms', '-', '');
    return delay(db.set('cms', { published: draft, draft, updatedAt: new Date().toISOString(), updatedBy: actor, revisions }));
  },
  restore: (index, actor) => {
    const cms = db.get('cms');
    const rev = cms.revisions[index];
    audit(actor, 'restore-revision', 'cms', '-', rev.at);
    return delay(db.set('cms', { ...cms, draft: rev.content }));
  },
};

export const contentService = {
  getSettings: () => (USE_MOCK ? mock.getSettings() : http.get('/settings')),
  updateSettings: (data, actor) => (USE_MOCK ? mock.updateSettings(data, actor) : http.put('/admin/settings', data)),
  getCms: () => (USE_MOCK ? mock.getCms() : http.get('/cms')),
  getCmsAdmin: () => (USE_MOCK ? mock.getCmsAdmin() : http.get('/admin/cms')),
  saveDraft: (draft, actor) => (USE_MOCK ? mock.saveDraft(draft, actor) : http.put('/admin/cms/draft', draft)),
  publish: (draft, actor) => (USE_MOCK ? mock.publish(draft, actor) : http.post('/admin/cms/publish', draft)),
  restore: (index, actor) => (USE_MOCK ? mock.restore(index, actor) : http.post(`/admin/cms/revisions/${index}/restore`)),
};
