<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210715010338 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE workspace (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, creation_date DATETIME NOT NULL, name VARCHAR(255) NOT NULL, token VARCHAR(510) DEFAULT NULL, INDEX IDX_8D940019A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8MB4 COLLATE `UTF8MB4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE workspace ADD CONSTRAINT FK_8D940019A76ED395 FOREIGN KEY (user_id) REFERENCES user_account (id)');
        $this->addSql('ALTER TABLE user_account DROP api_token');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE workspace');
        $this->addSql('ALTER TABLE user_account ADD api_token VARCHAR(190) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`');
    }
}
