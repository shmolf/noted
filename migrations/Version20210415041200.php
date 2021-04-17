<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210415041200 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE markdown_note (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, content MEDIUMTEXT DEFAULT NULL, title VARCHAR(255) DEFAULT NULL, created_date DATETIME NOT NULL, last_modified DATETIME NOT NULL, INDEX IDX_3DDA57529D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `UTF8MB4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE markdown_note_note_tag (markdown_note_id INT NOT NULL, note_tag_id INT NOT NULL, INDEX IDX_E9AA09549A85CF8A (markdown_note_id), INDEX IDX_E9AA0954A20034C5 (note_tag_id), PRIMARY KEY(markdown_note_id, note_tag_id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `UTF8MB4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE note_tag (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, name VARCHAR(255) NOT NULL, INDEX IDX_737A97639D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `UTF8MB4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE markdown_note ADD CONSTRAINT FK_3DDA57529D86650F FOREIGN KEY (user_id_id) REFERENCES user_account (id)');
        $this->addSql('ALTER TABLE markdown_note_note_tag ADD CONSTRAINT FK_E9AA09549A85CF8A FOREIGN KEY (markdown_note_id) REFERENCES markdown_note (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE markdown_note_note_tag ADD CONSTRAINT FK_E9AA0954A20034C5 FOREIGN KEY (note_tag_id) REFERENCES note_tag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE note_tag ADD CONSTRAINT FK_737A97639D86650F FOREIGN KEY (user_id_id) REFERENCES user_account (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE markdown_note_note_tag DROP FOREIGN KEY FK_E9AA09549A85CF8A');
        $this->addSql('ALTER TABLE markdown_note_note_tag DROP FOREIGN KEY FK_E9AA0954A20034C5');
        $this->addSql('DROP TABLE markdown_note');
        $this->addSql('DROP TABLE markdown_note_note_tag');
        $this->addSql('DROP TABLE note_tag');
    }
}
