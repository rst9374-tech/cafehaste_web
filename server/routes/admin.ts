import { Router } from 'express';
import loginRouter from './admin/login';
import membersRouter from './admin/members';
import memberActionsRouter from './admin/member_actions';
import heroRouter from './admin/hero';
import filmsRouter from './admin/films';
import soundsRouter from './admin/sounds';
import interiorsRouter from './admin/interiors';
import menuRouter from './admin/menu';
import licensesRouter from './admin/licenses';
import licenseLogsRouter from './admin/license_logs';
import cleanRouter from './admin/clean';
import hqstampRouter from './admin/hqstamp';
import kakaoInjectorRouter from './admin/kakao_injector';
import settingsRouter from './admin/settings';

const router = Router();

// Mount all subdivided modularized administrative router sets
router.use(loginRouter);
router.use(membersRouter);
router.use(memberActionsRouter);
router.use(heroRouter);
router.use(filmsRouter);
router.use(soundsRouter);
router.use(interiorsRouter);
router.use(menuRouter);
router.use(licensesRouter);
router.use(licenseLogsRouter);
router.use(cleanRouter);
router.use(hqstampRouter);
router.use(kakaoInjectorRouter);
router.use(settingsRouter);

export default router;
