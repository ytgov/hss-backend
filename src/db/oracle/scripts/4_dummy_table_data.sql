--------------------------------------------------------
--  GENERAL dummy data
--------------------------------------------------------
INSERT INTO "GENERAL"."USER_DATA" (USER_NAME,USER_EMAIL) VALUES ('Francisco', 'francisco@bizont.ca');
INSERT INTO "GENERAL"."USER_DATA" (USER_NAME,USER_EMAIL) VALUES ('edgarallanglez', 'edgar@bizont.ca');
INSERT INTO "GENERAL"."USER_DATA" (USER_NAME,USER_EMAIL) VALUES ('Mariazel', 'mariazel@bizont.ca');


INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('1', '2');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('1', '4');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('1', '6');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('2', '2');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('2', '6');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('2', '4');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('3', '2');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('3', '4');
INSERT INTO "GENERAL"."USER_ROLES" (USER_ID,ROLE_ID) VALUES ('3', '6');


--------------------------------------------------------
--  CONSTELLATION_HEALTH dummy data
--------------------------------------------------------
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (6, 1, 'Ringo', 'Lennon', 'Yes, this is my legal name', 'Ringo Lennon', 'Dixisset', TO_DATE('1925-04-02', 'yyyy-mm-dd'), 'Yes, my health care card is from the Yukon.', '', '', '898-989-898', '11111', 'I want to be contacted by email', '', 'random@random.com', NULL, 3, 'Loremipsumhjbhjjh', 'Yes, I will need interpretation support', 'No, I don’t currently have a family physician', '', 'Dixisset', utl_raw.cast_to_raw('{ data:[5,7,15] }'), 1, 'Yes, I have other family members to include', TO_DATE('2023-02-03 01:05:03', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-02 21:51:34', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (7, 1, 'George', 'Starr', 'Yes, this is my legal name', 'George Starr', 'Oratione', TO_DATE('1930-09-07', 'yyyy-mm-dd'), 'No, my health care card is from a different province/territory.', 'Dixisset', 'Dixisset', '', '12345-6789', 'I want to be contacted by email', '', 'random@random.com', NULL, 1, '', NULL, 'Yes, I currently have a family physician', 'Oratione', '', utl_raw.cast_to_raw('{ data: [5,7,15] }'), 4, 'Yes, I have other family members to include', TO_DATE('2023-02-06 19:29:49', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-02 21:51:34', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (2, 3, 'Paul', 'Starr', 'Yes, this is my legal name', 'Paul Starr', 'Oratione', TO_DATE('1959-06-05', 'yyyy-mm-dd'), 'No, my health care card is from a different province/territory.', 'Dixisset', 'Dixisset', '', '12345-6789', 'I want to be contacted by email', '', 'random@random.com', '\N', 3, 'Oratione', 'No, I won’t need interpretation support', 'No, I don’t currently have a family physician', '', 'Loremipsum', utl_raw.cast_to_raw('{ data:[15] }'), 1, 'No, I don’t want to include anyone else on this application', TO_DATE('2023-02-01 22:43:55', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-01 22:43:55', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (1, 3, 'Paul', 'Lennon', 'No, this is not my legal name', 'Paul Lennon', 'Oratione', TO_DATE('1994-07-05', 'yyyy-mm-dd'), 'No, my health care card is from a different province/territory.', 'Dixisset', 'Loremipsum', '', '12345', 'I want to be contacted by email', '', 'test@test.com', '\N', 2, '', 'No, I won’t need interpretation support', 'Yes, I currently have a family physician', 'Loremipsum', '', utl_raw.cast_to_raw('{ data:[3,4,7] }'), 3, 'No, I don’t want to include anyone else on this application', TO_DATE('2023-02-01 18:55:55', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-01 18:55:55', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (5, 1, 'George', 'McCartney', 'No, this is not my legal name', 'What is your legal name?', 'Oratione', TO_DATE('1925-04-04', 'yyyy-mm-dd'), 'Yes, my health care card is from the Yukon.', '', '', '099-090-900', '11111', 'I want to be contacted by email', '', 'test@test.com', '\N', 2, '', 'Yes, I will need interpretation support', 'Yes, I currently have a family physician', 'Dixisset', '', utl_raw.cast_to_raw('{ data: [3,4,5] }'), 2, 'Yes, I have other family members to include', TO_DATE('2023-02-03 00:55:54', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-03 00:55:54', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (4, 3, 'George', 'Harrison', 'No, this is not my legal name', 'THIS IS MY LEGAL NAME', 'Oratione', TO_DATE('1996-07-08', 'yyyy-mm-dd'), 'Yes, my health care card is from the Yukon.', '', '', '934-909-090', '11111', 'I want to be contacted by phone', '(123) 456-7890', '', 'No, do not leave a message', 1, '', '\N', 'Yes, I currently have a family physician', 'Dixisset', '', utl_raw.cast_to_raw('{ data: [1,2,3,4,7] }'), 2, 'Yes, I have other family members to include', TO_DATE('2023-02-03 00:40:26', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-03 00:40:26', 'yyyy-mm-dd hh24:mi:ss'));
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH VALUES (3, 3, 'George', 'McCartney', 'No, this is not my legal name', 'George McCartney', 'Dixisset', TO_DATE('1998-05-03', 'yyyy-mm-dd'), 'No, my health care card is from a different province/territory.', 'Loremipsum', 'Dixisset', '', '12345-6789', 'I want to be contacted by phone', '(098) 765-4321', '', 'No, do not leave a message', 2, '', 'Yes, I will need interpretation support', 'Yes, I currently have a family physician', 'Dixisset', '', utl_raw.cast_to_raw('{ data: [1,2,3,4,5,6,7,"TEST OTHER"] }'), 2, 'Yes, I have other family members to include', TO_DATE('2023-02-01 22:52:49', 'yyyy-mm-dd hh24:mi:ss'), TO_DATE('2023-02-01 22:52:49', 'yyyy-mm-dd hh24:mi:ss'));

INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH_FAMILY_MEMBERS VALUES (1, 6, 'Paul', 'Lennon', 'Yes, this is their legal name', '', 'Oratione', TO_DATE('2012-08-05', 'yyyy-mm-dd'), 'Yes, their health care card is from the Yukon.', '', '', '092-390-494', 'Loremipsum', 6, 'Oratione', 'Yes, they will need interpretation support', 'No, they don’t currently have a family physician', '', 'Oratione', utl_raw.cast_to_raw('{data: [15]}'), 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH_FAMILY_MEMBERS VALUES (2, 7, 'George', 'McCartney', 'Yes, this is their legal name', '', 'Loremipsum', TO_DATE('1936-06-05', 'yyyy-mm-dd'), 'No, their health care card is from a different province/territory.', 'Oratione', 'Dixisset', '', 'Oratione', 4, '', '', 'No, they don’t currently have a family physician', '', 'Dixisset', utl_raw.cast_to_raw('{data: [8,12,15]}'), 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO CONSTELLATION_HEALTH.CONSTELLATION_HEALTH_FAMILY_MEMBERS VALUES (3, 7, 'jhbhjhbjhjbhhjbhjh', 'jhjhhjjhjbhbhj', 'No, this is not their legal name', 'jhbhjhbjhjbhhjbhjh jhjhhjjhjbhbhj', 'erer', TO_DATE('2017-05-04', 'yyyy-mm-dd'), 'No, their health care card is from a different province/territory.', 'erererer', 'erreer', '', 'rerere', 5, '', 'No, they won’t need interpretation support', 'Yes, they currently have a family physician', 'erreerer', '', utl_raw.cast_to_raw('{data: [8,13]}'), 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

--------------------------------------------------------
--  HIPMA dummy data
--------------------------------------------------------
INSERT INTO HIPMA.HEALTH_INFORMATION VALUES (1, '5F2B4B7C2', 1, 2, 2, 4, 'Paul', 'Lennon', 'Oratione', '11 Brook Alley Road. APT 1', 'Springfield', '12345', '10mainstreet@jh.klk', '(098) 765-4321', 'Paul', 'McCartney', TO_DATE('2012-09-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@jkjn.kjn', '(123) 456-7890', NULL, 2, NULL, utl_raw.cast_to_raw('{ data: [3] }'), '', NULL, NULL, 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO HIPMA.HEALTH_INFORMATION VALUES (2, '5F2B4BDA9', 1, 1, 1, NULL, '', '', '', '', '', '', '', '', 'Ringo', 'McCartney', TO_DATE('2017-10-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@hjhj.jknkjn', '(123) 456-7890', 3, NULL, utl_raw.cast_to_raw('{ data: [1] }'), NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', TO_DATE('2022-03-02', 'yyyy-mm-dd'), TO_DATE('2022-08-02', 'yyyy-mm-dd'), 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO HIPMA.HEALTH_INFORMATION VALUES (3, '5F2B4C2FF', 1, 1, 2, 4, 'George', 'McCartney', 'Loremipsum', '10 Main Street', 'Pleasantville', '11111', '10mainstreet@jjh.jkn', '(098) 765-4321', 'Ringo', 'Harrison', TO_DATE('2010-10-06', 'yyyy-mm-dd'), '10 Main Street', 'Springfield', '12345', '11brookalleyroad.apt1j@jkn.jkn', '(098) 765-4321', 3, NULL, utl_raw.cast_to_raw('{ data: [5] }'), NULL, 'Huius, Lyco, oratione locuples, rebus ipsis ielunior. Duo Reges: constructio interrete. Sed haec in pueris; Sed utrum hortandus es nobis, Luci, inquit, an etiam tua sponte propensus es? Sapiens autem semper beatus est et est aliquando in dolore; Immo videri fortasse. Paulum, cum regem Persem captum adduceret, eodem flumine invectio? Et ille ridens: Video, inquit, quid agas;', NULL, NULL, 1, '1', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO HIPMA.HEALTH_INFORMATION VALUES (4, '5F2B4BDA9', 1, 1, 1, NULL, '', '', '', '', '', '', '', '', 'Ringo', 'McCartney', TO_DATE('2017-10-06', 'yyyy-mm-dd'), '11 Brook Alley Road. APT 1', 'Springfield', '11111', '10mainstreet@hjhj.jknkjn', '(123) 456-7890', 3, NULL, utl_raw.cast_to_raw('{ data: [1] }'), utl_raw.cast_to_raw('{ data: ["NULL"] }'), 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', TO_DATE('2022-03-02', 'yyyy-mm-dd'), TO_DATE('2022-08-02', 'yyyy-mm-dd'), 1, '1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO HIPMA.HEALTH_INFORMATION VALUES (5, '5F2B4C2FF', 1, 1, 2, 4, 'George', 'McCartney', 'Loremipsum', '10 Main Street', 'Pleasantville', '11111', '10mainstreet@jjh.jkn', '(098) 765-4321', 'Ringo', 'Harrison', TO_DATE('2010-10-06', 'yyyy-mm-dd'), '10 Main Street', 'Springfield', '12345', '11brookalleyroad.apt1j@jkn.jkn', '(098) 765-4321', 3, NULL, utl_raw.cast_to_raw('{ data: [5] }'), utl_raw.cast_to_raw('{ data: ["NULL"] }'), 'Huius, Lyco, oratione locuples, rebus ipsis ielunior. Duo Reges: constructio interrete. Sed haec in pueris; Sed utrum hortandus es nobis, Luci, inquit, an etiam tua sponte propensus es? Sapiens autem semper beatus est et est aliquando in dolore; Immo videri fortasse. Paulum, cum regem Persem captum adduceret, eodem flumine invectio? Et ille ridens: Video, inquit, quid agas;', NULL, NULL, 1, '1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

--------------------------------------------------------
--  MIDWIFERY dummy data
--------------------------------------------------------
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (1, '5F30A640F', 1, 'George', 'McCartney', 'George McCartney', 'Loremipsum', TO_DATE('2019-07-04', 'YYYY-MM-DD'), 1, 12, 2, 4, '123-456-7890', 'dixisset@mnfjkds.sd.eew._', 5, 1, TO_DATE('2022-03-03', 'YYYY-MM-DD'), TO_DATE('2024-02-02', 'YYYY-MM-DD'), 7, 9, '', '', NULL, '', NULL, 3, 16, '', 18, 'Dixisset', 20, '', 22, '', utl_raw.cast_to_raw('{ data: [2,6,10] }'), utl_raw.cast_to_raw('{ data: [1,2,5] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (2, '5F30A6A42', 1, 'John', 'Lennon', 'John Lennon', 'Loremipsum', TO_DATE('2018-07-08', 'YYYY-MM-DD'), 1, 19, 1, 3, '098-765-4321', 'loremipsumee@ewwe.wwe', 5, 2, TO_DATE('2022-03-04', 'YYYY-MM-DD'), TO_DATE('2024-03-04', 'YYYY-MM-DD'), 7, 10, 'Dixisset', 'Oratione', 12, '', 14, 3, 16, '', 17, 'Loremipsum', 20, '', 21, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', utl_raw.cast_to_raw('{ data: [3,5,8] }'), utl_raw.cast_to_raw('{ data: [3,4,5] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (3, '5F30A6B76', 1, 'Paul', 'McCartney', 'Paul McCartney', 'Oratione', TO_DATE('2020-07-04', 'YYYY-MM-DD'), 2, 6, 1, 3, '098-765-4321', 'loremipsumwew@eew.eww', 5, 1, TO_DATE('2022-03-03', 'YYYY-MM-DD'), TO_DATE('2024-02-02', 'YYYY-MM-DD'), 7, 10, 'Oratione', 'Dixisset', 11, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', 13, 2, 16, '', 18, 'Oratione', 20, '', 22, '', utl_raw.cast_to_raw('{ data: [2,4,9] }'), utl_raw.cast_to_raw('{ data: [2,3,5] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (4, '5F30AA2BE', 1, 'Ringo', 'Harrison', 'Ringo Harrison', 'Oratione', TO_DATE('2019-07-03', 'YYYY-MM-DD'), 2, 6, 2, 3, '098-765-4321', 'dixissetbiz@bizont.lkmnfdkd', 5, 2, TO_DATE('2022-04-03', 'YYYY-MM-DD'), TO_DATE('2024-03-03', 'YYYY-MM-DD'), 7, 10, 'Loremipsum', 'Oratione', 11, 'Quae cum dixisset, finem ille. Quamquam non negatis nos intellegere quid sit voluptas, sed quid ille dicat. Progredientibus autem aetatibus sensim tardeve potius quasi nosmet ipsos cognoscimus. Gloriosa ostentatio in constituendo summo bono. Qui-vere falsone, quaerere mittimus-dicitur oculis se privasse; Duarum enim vitarum nobis erunt instituta capienda. Comprehensum, quod cognitum non habet? Qui enim existimabit posse se miserum esse beatus non erit. Causa autem fuit huc veniendi ut quosdam hinc libros promerem. Nunc omni virtuti vitium contrario nomine opponitur.', 13, 1, 15, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', 18, 'Dixisset', 19, 'Oratione', 22, '', utl_raw.cast_to_raw('{ data: [5,9,10] }'), utl_raw.cast_to_raw('{ data: [1,3,5] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (5, '5F30AA4B1', 1, 'Paul', 'Harrison', 'Paul Harrison', 'Oratione', TO_DATE('2007-06-03', 'YYYY-MM-DD'), 1, 8, 2, 3, '123-456-7890', 'loremipsum@dfd.fdfd', 5, 2, TO_DATE('2022-04-04', 'YYYY-MM-DD'), TO_DATE('2024-04-03', 'YYYY-MM-DD'), 7, 9, '', '', NULL, '', NULL, 1, 15, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Negat esse eam, inquit, propter se expetendam. Primum Theophrasti, Strato, physicum se voluit; Id mihi magnum videtur. Itaque mihi non satis videmini considerare quod iter sit naturae quaeque progressio. Quare hoc videndum est, possitne nobis hoc ratio philosophorum dare. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere.', 17, 'Dixisset', 19, 'Loremipsum', 21, 'Quae cum dixisset, finem ille. Quamquam non negatis nos intellegere quid sit voluptas, sed quid ille dicat. Progredientibus autem aetatibus sensim tardeve potius quasi nosmet ipsos cognoscimus. Gloriosa ostentatio in constituendo summo bono. Qui-vere falsone, quaerere mittimus-dicitur oculis se privasse; Duarum enim vitarum nobis erunt instituta capienda. Comprehensum, quod cognitum non habet? Qui enim existimabit posse se miserum esse beatus non erit. Causa autem fuit huc veniendi ut quosdam hinc libros promerem. Nunc omni virtuti vitium contrario nomine opponitur.', utl_raw.cast_to_raw('{ data: [6,8,10] }'), utl_raw.cast_to_raw('{ data: [1,3,4] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO MIDWIFERY.MIDWIFERY_SERVICES VALUES (6, '5F30AB870', 1, 'Ringo', 'Starr', 'Ringo Starr', 'Dixisset', TO_DATE('1920-08-06', 'YYYY-MM-DD'), 2, 17, 2, 4, '098-765-4321', 'orationek@dd.dfdfd', 5, 1, TO_DATE('2023-04-06', 'YYYY-MM-DD'), TO_DATE('2023-12-04', 'YYYY-MM-DD'), 7, 9, '', '', NULL, '', NULL, 2, 16, '', 17, 'Dixisset', 20, '', 21, 'Quae cum dixisset, finem ille. Quamquam non negatis nos intellegere quid sit voluptas, sed quid ille dicat. Progredientibus autem aetatibus sensim tardeve potius quasi nosmet ipsos cognoscimus. Gloriosa ostentatio in constituendo summo bono. Qui-vere falsone, quaerere mittimus-dicitur oculis se privasse; Duarum enim vitarum nobis erunt instituta capienda. Comprehensum, quod cognitum non habet? Qui enim existimabit posse se miserum esse beatus non erit. Causa autem fuit huc veniendi ut quosdam hinc libros promerem. Nunc omni virtuti vitium contrario nomine opponitur.', utl_raw.cast_to_raw('{ data: [5,7,9] }'), utl_raw.cast_to_raw('{ data: [1,2,5] }'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);