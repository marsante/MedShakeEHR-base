-- Mise à jour n° de version
UPDATE `system` SET `value`='v7.1.2' WHERE `name`='base' and `groupe`='module';


-- création de la table motsuivi
CREATE TABLE IF NOT EXISTS `motsuivi` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fromID` INT(11) UNSIGNED NOT NULL,
  `toID` INT(11) UNSIGNED NOT NULL,
  `dateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `texte` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fromID` (`fromID`),
  KEY `toID` (`toID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- actout des options relative au mot de suivi
INSERT IGNORE INTO `configuration` (`name`, `level`, `toID`, `module`, `cat`, `type`, `description`, `value`) VALUES ('optionsDossierPatientActiverMotSuivi', 'default', '0', '', 'Options dossier patient', 'true/false', 'activier / désactiver le mot suivi sur le dossier d\'un patient', 'false');
INSERT IGNORE INTO `configuration` (`name`, `level`, `toID`, `module`, `cat`, `type`, `description`, `value`) VALUES ('optionsDossierPatientNbMotSuiviAfficher', 'default', '0', '', 'Options dossier patient', 'int', 'nombre de mot suivi à afficher par défaut sur un dossier patient', '6');
INSERT IGNORE INTO `configuration` (`name`, `level`, `toID`, `module`, `cat`, `type`, `description`, `value`) VALUES ('droitMotSuiviPeutModifierSuprimerDunAutre', 'default', '0', '', 'Droits', 'true/false', 'si coché, l\'utilisateur peut suprimer et modifier un mot de suivi crée par un autre', 'false');

-- data_types
SET @catID = (SELECT data_cat.id FROM data_cat WHERE data_cat.name='divers');
INSERT IGNORE INTO `data_types` (`groupe`, `name`, `placeholder`, `label`, `description`, `validationRules`, `validationErrorMsg`, `formType`, `formValues`, `module`, `cat`, `fromID`, `creationDate`, `durationLife`, `displayOrder`) VALUES
('admin', 'preferedSendingMethod', '', 'Méthode d\'envoie préféré', 'Permet de choisir la méthode de d\'envoi préféré pour le transfert d\'un document patient', '', '', 'select', '\'NONE\' : \'Aucune méthode d'envoi préféré\'', 'base', @catID, '1', '2019-01-01 00:00:00', '3600', '10'),
('admin', 'clicRdvPatientId', 'ID patient', 'ID patient', 'ID patient', '', '', 'text', '', 'base', @catID, '1', '2018-01-01 00:00:00', '3600', '1');

-- forms
SET @catID = (SELECT forms_cat.id FROM forms_cat WHERE forms_cat.name='patientforms');
INSERT IGNORE INTO `forms` (`module`, `internalName`, `name`, `description`, `dataset`, `groupe`, `formMethod`, `formAction`, `cat`, `type`, `yamlStructure`, `options`, `printModel`, `cda`, `javascript`) VALUES
('base', 'baseNewPro', 'Formulaire nouveau pro', 'formulaire d\'enregistrement d\'un nouveau pro', 'data_types', 'admin', 'post', '/pro/register/', @catID, 'public', 'structure:\r\n  row1:                              \r\n    col1:                            \r\n      head: \'Etat civil\'            \r\n      size: 4\r\n      bloc:                          \r\n        - administrativeGenderCode                 		#102  Sexe\n        - job,autocomplete,rows=1                  		#1    Activité professionnelle\n        - titre,autocomplete                       		#109  Titre\n        - birthname,autocomplete,data-acTypeID=firstname:othersfirstname:igPrenomFA:igPrenomFB:igPrenomFC 		#104  Nom de naissance\n        - lastname,autocomplete,data-acTypeID=lastname:birthname 		#107  Nom d usage\n        - firstname,autocomplete,data-acTypeID=firstname:othersfirstname:igPrenomFA:igPrenomFB:igPrenomFC 		#106  Prénom\n\r\n    col2:\r\n      head: \'Contact\'\r\n      size: 4\r\n      bloc:\r\n        - emailApicrypt                            		#61   Email apicrypt\n        - profesionnalEmail                        		#68   Email professionnelle\n        - personalEmail                            		#66   Email personnelle\n        - telPro                                   		#69   Téléphone professionnel\n        - telPro2                                  		#70   Téléphone professionnel 2\n        - mobilePhonePro                           		#65   Téléphone mobile pro.\n        - faxPro                                   		#62   Fax professionnel\n    col3:\r\n      head: \'Adresse professionnelle\'\r\n      size: 4\r\n      bloc: \r\n        - numAdressePro                            		#10   n°\n        - rueAdressePro,autocomplete,data-acTypeID=street:rueAdressePro 		#12   Voie\n        - codePostalPro                            		#8    Code postal\n        - villeAdressePro,autocomplete,data-acTypeID=city:villeAdressePro 		#14   Ville\n        - serviceAdressePro,autocomplete           		#13   Service\n        - etablissementAdressePro,autocomplete     		#9    Établissement\n  row2:\r\n    col1:\r\n      size: 12\r\n      bloc:\r\n        - notesPro,rows=3                          		#87   Notes pros\n\r\n  row3:\r\n    col1:\r\n      size: 4\r\n      bloc:\r\n        - rpps                                     		#150  RPPS\n        - PSIdNat                                  		#145  Identifiant national praticien santé\n    col2:\r\n      size: 4\r\n      bloc:\r\n        - adeli                                    		#146  Adeli\n        - PSCodeProSpe,plus={<i class=\"fas fa-pen\"></i>} 		#143  Code normé de la profession/spécialité du praticien\n    col3:\r\n      size: 4\r\n      bloc:\r\n        - nReseau                                  		#147  Numéro de réseau\n        - PSCodeStructureExercice,plus={<i class=\"fas fa-pen\"></i>} 		#144  Code normé de la structure d exercice du praticien\n  row4:\r\n    col1:\r\n      size: 12\r\n      bloc:\r\n        - preferedSendingMethod                    		#519  Méthode d envoie préféré', '', '', '', '$(document).ready(function() {\r\n\r\n   // modal edit data admin patient\r\n  $(\'#newPro\').on(\'shown.bs.modal\', function (e) {\r\n    autosize.update($(\'#newPro textarea\'));\r\n  });\r\n  \r\n  //ajutement auto des textarea en hauteur\r\n  autosize($(\'#formName_baseNewPro textarea\')); \r\n\r\n});')
ON DUPLICATE KEY UPDATE module=values(module), internalName=values(internalName), name=values(name), description=values(description), dataset=values(dataset), groupe=values(groupe), formMethod=values(formMethod), formAction=values(formAction), cat=@catID, type=values(type), yamlStructure=values(yamlStructure), options=values(options), printModel=values(printModel), cda=values(cda), javascript=values(javascript);


