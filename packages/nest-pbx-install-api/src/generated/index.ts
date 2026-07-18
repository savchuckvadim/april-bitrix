// Hand-maintained barrel of generated tag clients (orval `tags-split` does not
// emit a root index). Add new tag re-exports here as endpoints are wired up on
// the frontend. Schemas are re-exported separately via ./model.

// Company
export * from './pbx-company-install/pbx-company-install';
export * from './pbx-company-install-monitoring/pbx-company-install-monitoring';

// Deal — fields
export * from './pbx-deal-field-install/pbx-deal-field-install';
export * from './pbx-deal-field-install-monitoring/pbx-deal-field-install-monitoring';
// Deal — categories / stages
export * from './pbx-deal-category-install/pbx-deal-category-install';
export * from './pbx-deal-category-install-monitoring/pbx-deal-category-install-monitoring';

// User
export * from './pbx-user/pbx-user';
export * from './pbx-user-install/pbx-user-install';
export * from './pbx-user-install-monitoring/pbx-user-install-monitoring';

// Task
export * from './pbx-task-install/pbx-task-install';
export * from './pbx-task-install-monitoring/pbx-task-install-monitoring';

// Departament
export * from './pbx-departament-install/pbx-departament-install';
export * from './pbx-departament-install-monitoring/pbx-departament-install-monitoring';
export * from './pbx-portal-departament-db/pbx-portal-departament-db';

// Calling group
export * from './pbx-group-install/pbx-group-install';
export * from './pbx-group-install-monitoring/pbx-group-install-monitoring';

// Smart processes
export * from './pbx-smart-install/pbx-smart-install';
export * from './pbx-smart-field-install/pbx-smart-field-install';
export * from './pbx-smart-field-install-monitoring/pbx-smart-field-install-monitoring';
export * from './pbx-smart-category-install/pbx-smart-category-install';
export * from './pbx-smart-category-install-monitoring/pbx-smart-category-install-monitoring';

// RPA processes
export * from './pbx-rpa-install/pbx-rpa-install';
export * from './pbx-rpa-field-install/pbx-rpa-field-install';
export * from './pbx-rpa-field-install-monitoring/pbx-rpa-field-install-monitoring';
export * from './pbx-rpa-category-install/pbx-rpa-category-install';
export * from './pbx-rpa-category-install-monitoring/pbx-rpa-category-install-monitoring';
export * from './pbx-rpa-parse-template/pbx-rpa-parse-template';

// Contact — fields
export * from './pbx-contact-install/pbx-contact-install';
export * from './pbx-contact-install-monitoring/pbx-contact-install-monitoring';

// Lead — fields
export * from './pbx-lead-field-install/pbx-lead-field-install';
export * from './pbx-lead-field-install-monitoring/pbx-lead-field-install-monitoring';
// Lead — stages (mapping)
export * from './pbx-lead-stage-install/pbx-lead-stage-install';
export * from './pbx-lead-stage-install-monitoring/pbx-lead-stage-install-monitoring';

// Requisites (RQ)
export * from './pbx-rq-install/pbx-rq-install';
export * from './pbx-rq-manage/pbx-rq-manage';
export * from './pbx-rq-install-monitoring/pbx-rq-install-monitoring';

// Portal integration keys (vibeKey etc.)
export * from './admin-portal-keys/admin-portal-keys';

// Portal providers (agent + requisites)
export * from './admin-portal-provider/admin-portal-provider';




//konstructor

//contract
export * from './pbx-contract/pbx-contract';
//measure
export * from './pbx-measure/pbx-measure';


//portal-measure
export * from './pbx-portal-measure/pbx-portal-measure';
export * from './pbx-portal-measure-monitoring/pbx-portal-measure-monitoring';

//portal-contract
export * from './pbx-portal-contract/pbx-portal-contract';


//base template
export * from './pbx-template-base/pbx-template-base';

//field (dictionary)
export * from './pbx-field/pbx-field';

//word template


//counter, document counter
export * from './document-counter-—-numbers/document-counter-—-numbers';
export * from './document-counter-—-admin/document-counter-—-admin';
export * from './pbx-counter/pbx-counter';

// Lists (универсальные списки)
export * from './pbx-list-install/pbx-list-install';
export * from './pbx-list-install-monitoring/pbx-list-install-monitoring';
export * from './pbx-list-field-install/pbx-list-field-install';
export * from './pbx-list-parse-template/pbx-list-parse-template';
