import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate, {translate} from '@docusaurus/Translate';

import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />"
      wrapperClassName={styles.homeLayout}>
      <main className={styles.mainContainer}>
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroSubtitle}>
            <Translate
              id="homepage.hero.subtitle"
              description="The homepage hero subtitle">
              开发者友好的文档中心，一站式解决您的技术文档需求
            </Translate>
          </p>
        </div>
        
        <div className={styles.cardsContainer}>
          <Link to="https://koin.openaidoc.org" className={clsx(styles.card, styles.koinCard)}>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Koin</h2>
              <p className={styles.cardDescription}>
                <Translate
                  id="homepage.card.koin.description"
                  description="Description of Koin framework">
                  轻量级的依赖注入框架，为Kotlin应用设计
                </Translate>
              </p>
              <div className={styles.cardIcon}></div>
            </div>
          </Link>
          
          <Link to="https://kotlin.openaidoc.org" className={clsx(styles.card, styles.kotlinCard)}>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Kotlin</h2>
              <p className={styles.cardDescription}>
                <Translate
                  id="homepage.card.kotlin.description"
                  description="Description of Kotlin language">
                  现代、简洁且安全的编程语言
                </Translate>
              </p>
              <div className={styles.cardIcon}></div>
            </div>
          </Link>
          
          <Link to="https://ktor.openaidoc.org" className={clsx(styles.card, styles.ktorCard)}>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Ktor</h2>
              <p className={styles.cardDescription}>
                <Translate
                  id="homepage.card.ktor.description"
                  description="Description of Ktor framework">
                  为Kotlin打造的异步Web框架
                </Translate>
              </p>
              <div className={styles.cardIcon}></div>
            </div>
          </Link>
          
          <Link to="https://sqldelight.openaidoc.org" className={clsx(styles.card, styles.sqldelightCard)}>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>SQLDelight</h2>
              <p className={styles.cardDescription}>
                <Translate
                  id="homepage.card.sqldelight.description"
                  description="Description of SQLDelight">
                  从SQL语句生成类型安全的Kotlin代码
                </Translate>
              </p>
              <div className={styles.cardIcon}></div>
            </div>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
