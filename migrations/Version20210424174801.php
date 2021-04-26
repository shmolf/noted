<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210424174801 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE markdown_note ADD in_trashcan TINYINT(1) DEFAULT \'0\' NOT NULL, ADD note_uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', ADD client_uuid CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE content content MEDIUMTEXT DEFAULT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE markdown_note DROP in_trashcan, DROP note_uuid, DROP client_uuid, CHANGE content content MEDIUMTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`');
    }
}
