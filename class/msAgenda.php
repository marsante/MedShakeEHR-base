<?php
/*
 * This file is part of MedShakeEHR.
 *
 * Copyright (c) 2017
 * Bertrand Boutillier <b.boutillier@gmail.com>
 * http://www.medshake.net
 *
 * MedShakeEHR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * MedShakeEHR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MedShakeEHR.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Gestion de l'agenda et des rendez-vous
 *
 * @author Bertrand Boutillier <b.boutillier@gmail.com>
 */

class msAgenda
{
    /**
    * Event ID
    * @var int
    */
    private $_eventID;

    /**
    * User ID ( agenda de l'utilisateur n° )
    * @var int
    */
    private $_userID;

    /**
    * Date de début au format ISO8601
    * @var string
    */
    private $_startDate;

    /**
    * Date de fin au format ISO8601
    * @var string
    */
    private $_endDate;

    /**
    * Motif du rdv
    * @var string
    */
    private $_motif;
    /**
    * Type du rdv
    * @var string
    */
    private $_type;
    /**
    * ID du patient
    * @var int
    */
    private $_patientID;
    /**
    * Tableau des types de rdv
    * @var array
    */
    private $_tabTypesRdv;

    /**
    * set patientID
    * @param int $_patientID ID du patient
    */
    public function set_patientID($_patientID)
    {
        $this->_patientID = $_patientID;
        return $this;
    }


    /**
    * set motif
    * @param string $_motif motid de rendez-vous
    */
    public function set_motif($_motif)
    {
        $this->_motif = $_motif;
        return $this;
    }

    /**
    * set type
    * @param string $_type type de rendez-vous
    */
    public function set_type($_type)
    {
        $this->_type = $_type;
        return $this;
    }


    /**
    * Set startDate
    * @param string $startDate format ISO8601
    */
    public function setStartDate($startDate)
    {
        $this->_startDate = $startDate;
        return $this;
    }

    /**
    * Set eventID
    * @param int $_eventID eventID
    */
    public function set_eventID($_eventID)
    {
        $this->_eventID = $_eventID;
        return $this;
    }

    /**
    * Set userID (= n° du calendrier)
    * @param int $_userID N° commun user/calendrier
    */
    public function set_userID($_userID)
    {
        $this->_userID = $_userID;
        return $this;
    }

    /**
    * Set endDate
    * @param string $endDate format ISO8601
    */
    public function setEndDate($endDate)
    {
        $this->_endDate = $endDate;
        return $this;
    }

    /**
    * Ajouter ou update un rendez-vous en fonction de la présente ou non
    * de l'envetID
    */
    public function addOrUpdateRdv()
    {
        if (!isset($this->_startDate)) {
            throw new Exception('StartDate n\'est pas définie');
        }
        if (!isset($this->_endDate)) {
            throw new Exception('EndDate n\'est pas définie');
        }
        if (!isset($this->_userID)) {
            throw new Exception('UserID n\'est pas défini');
        }
        if (!isset($this->_patientID)) {
            throw new Exception('PatientID n\'est pas défini');
        }
        if (!isset($this->_type)) {
            throw new Exception('Type n\'est pas défini');
        }

        $data=array(
        'userid'=>$this->_userID,
        'start'=>$this->_startDate,
        'end'=>$this->_endDate,
        'type'=>$this->_type,
        'patientid'=>$this->_patientID,
        'motif'=>$this->_motif
      );

        if (isset($this->_eventID)) {
            $data['id']=$this->_eventID;
        } else {
            $this->_eventID=$data['id']=time();
            $data['dateAdd']=date('Y-m-d H:i:s');
        }

        msSQL::sqlInsert('agenda', $data);
        return $this->getEventByID();
    }

    /**
    * Obtenir les rendez-vous sur une plage calendaire déterminée
    * @return array tableau des rendez-vous
    */
      public function getEvents()
      {
          if (!isset($this->_startDate)) {
              throw new Exception('StartDate n\'est pas définie');
          }
          if (!isset($this->_endDate)) {
              throw new Exception('EndDate n\'est pas définie');
          }
          if (!isset($this->_userID)) {
              throw new Exception('UserID n\'est pas défini');
          }
          $formatedEvents=[];

          if ($events=msSQL::sql2tab("select a.id, a.start, a.end, a.type, a.patientid, a.statut, a.absente, a.motif, concat(n.value, ' ', p.value) as name
          from agenda as a
          left join objets_data as n on n.toID=a.patientid and n.outdated='' and n.deleted='' and n.typeID='2'
          left join objets_data as p on p.toID=a.patientid and p.outdated='' and p.deleted='' and p.typeID='3'
          where a.userid='".$this->_userID."' and a.statut='actif' and a.start >= '".$this->_startDate."' and a.end <= '".$this->_endDate."'
          group by a.id")) {
              foreach ($events as $e) {
                  $formatedEvents[]=$this->_formatEvent($e);
              }
          }
          return $formatedEvents;
      }

    /**
     * Obtenir les data d'un rendez-vous par son ID
     * @return array tableau des rendez-vous
     */
        public function getEventByID()
        {
            if (!isset($this->_eventID)) {
                throw new Exception('EventID n\'est pas définie');
            }

            if ($event=msSQL::sqlUnique("select a.id, a.start, a.end, a.type, a.patientid, a.statut, a.absente, a.motif, concat(n.value, ' ', p.value) as name
            from agenda as a
            left join objets_data as n on n.toID=a.patientid and n.outdated='' and n.deleted='' and n.typeID='2'
            left join objets_data as p on p.toID=a.patientid and p.outdated='' and p.deleted='' and p.typeID='3'
            where a.id= '".$this->_eventID."'
            group by a.id")) {
                $formatedEvent=$this->_formatEvent($event);
            }
            return $formatedEvent;
        }

    /**
    * Formater un rendez-vous
    * @param  array $e tableau datas rdv
    * @return array    rendez-vous formaté
    */
      private function _formatEvent($e)
      {
          global $p;
          if (!isset($this->_tabTypeRdv)) {
              if (is_file($p['config']['webDirectory'].'agendasConfigurations/configTypesRdv'.$this->_userID.'.yml')) {
                  $this->_tabTypeRdv=Spyc::YAMLLoad($p['config']['webDirectory'].'agendasConfigurations/configTypesRdv'.$this->_userID.'.yml');
              } else {
                  $this->_tabTypeRdv=array(
                '[C]'=> array(
                  'descriptif'=>'Consultation',
                  'backgroundColor'=>'#2196f3',
                  'borderColor'=>'#1e88e5',
                  'duree'=>15
                )
              );
              }
          }

          if (isset($this->_tabTypeRdv[$e['type']]['textColor'])) {
              $textColor=$this->_tabTypeRdv[$e['type']]['textColor'];
          } else {
              $textColor='#fff';
          }

          if ($e['absente']=='oui') {
              $class=array('hasmenu','eventAbsent');
          } else {
              $class=array('hasmenu');
          }

          $re=@array(
          'id'=>$e['id'],
          'title'=>$e['name'],
          'allDay'=>false,
          'start'=>$e['start'],
          'end'=>$e['end'],
          'editable'=>true,
          'backgroundColor'=> $this->_tabTypeRdv[$e['type']]['backgroundColor'],
          'borderColor' => $this->_tabTypeRdv[$e['type']]['borderColor'],
          'textColor'=>$textColor,
          'className'=>$class,
          'motif'=>$e['motif'],
          'type'=>$e['type'],
          'patientid'=>$e['patientid'],
          'absent'=>$e['absente']
          );

          if ($e['type']=='[off]') {
              $re['title']="Fermeture";
          }

          return $re;
      }

    /**
    * Supprimer un rendez-vous
    * @return void
    */
      public function delEvent()
      {
          if (!isset($this->_eventID)) {
              throw new Exception('EventID n\'est pas défini');
          }
          if (!isset($this->_userID)) {
              throw new Exception('UserID n\'est pas défini');
          }

          $data=array(
          'id'=>$this->_eventID,
          'userid'=>$this->_userID,
          'statut'=>'deleted'
        );
          msSQL::sqlInsert('agenda', $data);
      }

    /**
    * Déplacer un rendez-vous
    * @return void
    */
      public function moveEvent()
      {
          if (!isset($this->_eventID)) {
              throw new Exception('EventID n\'est pas défini');
          }
          if (!isset($this->_userID)) {
              throw new Exception('UserID n\'est pas défini');
          }
          if (!isset($this->_startDate)) {
              throw new Exception('StartDate n\'est pas définie');
          }
          if (!isset($this->_endDate)) {
              throw new Exception('EndDate n\'est pas définie');
          }
          $data=array(
          'id'=>$this->_eventID,
          'userid'=>$this->_userID,
          'start'=>$this->_startDate,
          'end'=>$this->_endDate
        );
          msSQL::sqlInsert('agenda', $data);
      }
    /**
    * Obtenir l'historique de rdv du patient
    * @param  int $limit nombe max de résultats
    * @return array tableau des data d'historique
    */
    public function getHistoriquePatient($limit=10)
    {
        $data['stats']['total']=msSQL::sqlUniqueChamp("select count(id) from agenda where patientid='".$this->_patientID."'");
        $data['stats']['ok']=msSQL::sqlUniqueChamp("select count(id) from agenda where patientid='".$this->_patientID."' and statut!='deleted' and  absente!='oui'");
        $data['stats']['annule']=msSQL::sqlUniqueChamp("select count(id) from agenda where patientid='".$this->_patientID."' and statut='deleted'");
        $data['stats']['absent']=msSQL::sqlUniqueChamp("select count(id) from agenda where patientid='".$this->_patientID."' and absente='oui'");
        $data['historique']=msSQL::sql2tab("select DATE_FORMAT(start, '%Y %m %d - %H:%i') as start, DATE_FORMAT(start, '%Y-%m-%dT%TZ') as dateiso, type, statut, absente, motif from agenda where patientid='".$this->_patientID."' order by start desc limit $limit");

        return $data;
    }

    /**
    * Marquer un rendez-vous comme non honoré
    */
    public function setPasVenu()
    {
        if (!isset($this->_eventID)) {
            throw new Exception('EventID n\'est pas défini');
        }
        if (!isset($this->_userID)) {
            throw new Exception('UserID n\'est pas défini');
        }


        $actuel=$this->getEventByID();

        if ($actuel['absent']=='oui') {
            $absent='non';
        } else {
            $absent='oui';
        }

        $data=array(
      'id'=>$this->_eventID,
      'userid'=>$this->_userID,
      'absente'=>$absent
      );
        msSQL::sqlInsert('agenda', $data);
    }

    public function getPatientsOfTheDay() {
      $tab=array();
      if (!isset($this->_userID)) {
          throw new Exception('UserID n\'est pas défini');
      }
      $this->setStartDate(date("Y-m-d 00:00:00"));
      $this->setEndDate(date("Y-m-d 23:59:59"));
      if($data=$this->getEvents()) {
        foreach ($data as $v) {
          if ($v['type'] != '[off]') {
             $tab[]=array(
              "id"=> $v['patientid'],
              "identite"=> $v['title'],
              "type"=> $v['type'],
              "heure"=> date("H:i", strtotime($v['start']))
            );
          }
        }
        return $tab;
      }
    }
}