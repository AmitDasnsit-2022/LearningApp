import express from 'express';
import * as validate from '../../helpers/validates.js';
import * as roles from '../../controllers/roles/rolesController.js';
import * as auths from '../../middlewares/auth.js';
const router = express();

router.post('/add', auths.admin('create'), validate.rolesValidate, roles.addRole);
router.post('/getall', auths.admin('read'), roles.getAllRoles);
router.post('/update', auths.admin('edit'), validate.roleId, roles.updateRole);
router.post('/delete', auths.admin('delete'), validate.roleId, roles.deleteRole);

export default router;