SET @catID = (SELECT data_cat.id FROM data_cat WHERE data_cat.name='ordoItems');
INSERT INTO `data_types` (`groupe`, `name`, `placeholder`, `label`, `description`, `validationRules`, `validationErrorMsg`, `formType`, `formValues`, `module`, `cat`, `fromID`, `creationDate`, `durationLife`, `displayOrder`) VALUES ('ordo', 'ordoImpressionNbLignes', '', 'Imprimer le nombre de lignes de prescription', 'imprimer le nombre de lignes de prescription', '', '', '', '', 'base', @catID, '1', '2020-01-01 00:00:00', '3600', '1');
