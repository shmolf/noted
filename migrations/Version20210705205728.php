<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210705205728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE markdown_note DROP FOREIGN KEY FK_3DDA57529D86650F');
        $this->addSql('DROP INDEX IDX_3DDA57529D86650F ON markdown_note');
        $this->addSql('DROP INDEX UNIQ_3DDA5752710541FE ON markdown_note');
        $this->addSql('ALTER TABLE markdown_note DROP note_uuid, CHANGE content content MEDIUMTEXT DEFAULT NULL, CHANGE user_id_id user_id INT NOT NULL, CHANGE client_uuid uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE markdown_note ADD CONSTRAINT FK_3DDA5752A76ED395 FOREIGN KEY (user_id) REFERENCES user_account (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3DDA5752D17F50A6 ON markdown_note (uuid)');
        $this->addSql('CREATE INDEX IDX_3DDA5752A76ED395 ON markdown_note (user_id)');
        $this->addSql('ALTER TABLE note_tag DROP FOREIGN KEY FK_737A97639D86650F');
        $this->addSql('DROP INDEX IDX_737A97639D86650F ON note_tag');
        $this->addSql('ALTER TABLE note_tag CHANGE user_id_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE note_tag ADD CONSTRAINT FK_737A9763A76ED395 FOREIGN KEY (user_id) REFERENCES user_account (id)');
        $this->addSql('CREATE INDEX IDX_737A9763A76ED395 ON note_tag (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE markdown_note DROP FOREIGN KEY FK_3DDA5752A76ED395');
        $this->addSql('DROP INDEX UNIQ_3DDA5752D17F50A6 ON markdown_note');
        $this->addSql('DROP INDEX IDX_3DDA5752A76ED395 ON markdown_note');
        $this->addSql('ALTER TABLE markdown_note ADD note_uuid CHAR(36) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci` COMMENT \'(DC2Type:guid)\', CHANGE content content MEDIUMTEXT CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, CHANGE user_id user_id_id INT NOT NULL, CHANGE uuid client_uuid CHAR(36) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE markdown_note ADD CONSTRAINT FK_3DDA57529D86650F FOREIGN KEY (user_id_id) REFERENCES user_account (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_3DDA57529D86650F ON markdown_note (user_id_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3DDA5752710541FE ON markdown_note (note_uuid)');
        $this->addSql('ALTER TABLE note_tag DROP FOREIGN KEY FK_737A9763A76ED395');
        $this->addSql('DROP INDEX IDX_737A9763A76ED395 ON note_tag');
        $this->addSql('ALTER TABLE note_tag CHANGE user_id user_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE note_tag ADD CONSTRAINT FK_737A97639D86650F FOREIGN KEY (user_id_id) REFERENCES user_account (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_737A97639D86650F ON note_tag (user_id_id)');
    }
}
