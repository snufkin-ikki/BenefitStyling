"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

const sizes = ["1〜9人", "10〜19人", "20〜49人", "50〜99人", "100〜299人", "300〜999人", "1,000〜4,999人", "5,000人以上"];
const fashionServices = ["買い物同行", "自宅訪問レクチャー", "断捨離サポート", "オンライン通販サポート", "マッチングアプリ写真撮影", "コーディネート診断サポート（お茶のみ）"];
const beautyServices = ["メイクレッスン（自宅）", "メイク相談&簡易レッスン（カフェ、フードコート等）", "コスメ買い物同行", "オンライン相談&レッスン", "ウェルネス/マインドフルビューティーカウンセリング（カフェ等）"];

export default function PreregisterPage() {
  const [size, setSize] = useState("");
  const [referral, setReferral] = useState("");
  const [serviceSelections, setServiceSelections] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!size || !referral || !consent) {
      setError("従業員規模、紹介の可否、入力情報の取扱いをご確認ください。");
      return;
    }
    const data = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/preregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: data.get("company"),
          email: data.get("email"),
          department: data.get("department"),
          title: data.get("title"),
          employeeSize: size,
          canReferDecisionMaker: referral === "yes",
          introductionLikelihood: Number(data.get("introductionLikelihood")),
          desiredServices: serviceSelections,
          desiredServiceOther: data.get("desiredServiceOther"),
          supportMessage: data.get("supportMessage"),
          website: data.get("website"),
          consent,
        }),
      });
      const result: { success?: boolean; error?: string } = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "送信できませんでした。もう一度お試しください。");
      setComplete(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "送信できませんでした。もう一度お試しください。");
    } finally { setPending(false); }
  }

  function moveService(service: string, direction: -1 | 1) {
    setServiceSelections((current) => {
      const from = current.indexOf(service);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  return <div className="registration-page">
    <header className="registration-header"><div className="registration-brand-lockup"><Link className="registration-logo" href="/" aria-label="Benefit Styling トップに戻る" /><span className="registration-brand-tagline">「オシャレ特化」の福利厚生サービス</span></div><Link href="/" className="registration-back">← サービス案内に戻る</Link></header>
    {complete ? <main className="registration-success">
      <p className="eyebrow">THANK YOU</p>
      <h1>事前登録を受け付けました。</h1>
      <p>Benefit Stylingへのご関心と、ご意見をありがとうございます。今後のご案内は、入力された法人メールアドレスにお送りします。</p>
      <p className="registration-small">この登録だけで所属先に費用や導入義務が発生することはありません。</p>
      <Link href="/" className="registration-return">サービス案内へ戻る ↗</Link>
      <section className="success-community" aria-labelledby="success-community-title">
        <p className="eyebrow">JOIN THE JOURNEY</p>
        <h2 id="success-community-title">興味がある、からの参加も歓迎です。</h2>
        <p>「法人メールを登録するほどではないけれど、スタートアップのBtoBサービスづくりを見てみたい」「立ち上げの現場に興味がある」——そんな方も、まずは気軽にご参加ください。</p>
        <div className="success-community-grid">
          <article><h3>まずは気軽に知りたい方</h3><p>Benefit Stylingの準備や、サービスが形になっていく様子に興味がある方。情報交換や応援からの参加も歓迎します。</p></article>
          <article><h3>運営づくりに協力したい方</h3><p>Benefit Stylingは社員ゼロで準備を進めています。だからこそ、サービスを「自分ごと」として一緒に育ててくださる仲間を探しています。プロボノ・社会人ボランティアとして、コミュニティ運営（企業担当者・営業メンバー・複業アドバイザーとの連携）をはじめ、広報・PR、SNS運営、マーケティング、UXデザイン、事業開発などに関心のある方を積極的に募集しています。まずはできることや興味のあることを、LINEオープンチャットで気軽にお聞かせください。</p></article>
        </div>
        <div className="success-titles">
          <h3>2枚目の名刺に使える肩書きもご用意します</h3>
          <p>関わり方や活動内容に合わせて、以下の肩書きをお選びいただけます。</p>
          <ul>
            <li>Benefit Styling オフィシャル・アンバサダー</li>
            <li>福利厚生コンサルティング・パートナー</li>
            <li>ワークライフデザイン・エバンジェリスト</li>
            <li>事業開発アライアンス・コーディネーター</li>
            <li>ライフスタイル・エージェント</li>
            <li>ウェルビーイング・パートナー</li>
            <li>ライフスタイル・コネクター</li>
            <li>HRスタイル・アドバイザー</li>
            <li>アライアンス・コーディネーター</li>
          </ul>
        </div>
        <a className="success-community-link" href="https://line.me/ti/g2/7oEOvoZZ7qEFQbvroOmNC0ZoU-OduUygEk99aQ?utm_source=invitation&amp;utm_medium=link_copy&amp;utm_campaign=default" target="_blank" rel="noopener noreferrer">LINEオープンチャット「Benefit Styling」で気軽につながる ↗</a>
      </section>
    </main> : <main className="registration-main">
      <div className="registration-intro">
        <p className="eyebrow">PRE-REGISTRATION</p>
        <h1>あなたの会社に、<br /><span>あったらうれしい。</span></h1>
        <p>Benefit Stylingは「オシャレ特化」の福利厚生サービスとしてローンチ準備中。企業・団体・学校・病院に所属する方から、事前登録とアイデアを募集しています。</p>
        <div className="registration-note"><b>人事・総務の担当者でなくても登録できます。</b><br />事前登録は、導入や購入の申込みではありません。</div>
        <div className="community-alternative"><p><b>法人メールでの登録はまだ迷っている方へ</b><br />メールアドレス登録なしで、LINEオープンチャットから気軽に参加できます。立ち上げ・運営を手伝いたい方も歓迎です。</p><a href="https://line.me/ti/g2/7oEOvoZZ7qEFQbvroOmNC0ZoU-OduUygEk99aQ?utm_source=invitation&amp;utm_medium=link_copy&amp;utm_campaign=default" target="_blank" rel="noopener noreferrer">LINEオープンチャットに参加する ↗</a></div>
      </div>
      <form className="registration-form" onSubmit={submit}>
        <div className="form-heading"><span>01</span><h2>まずは所属先について</h2></div>
        <div className="field"><label htmlFor="company">企業・団体・学校・病院名 <strong>必須</strong></label><Input id="company" name="company" autoComplete="organization" required maxLength={120} placeholder="例：株式会社サンプル" /></div>
        <div className="field"><label htmlFor="email">法人メールアドレス <strong>必須</strong></label><Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="例：your.name@company.co.jp" aria-describedby="email-help" /><p id="email-help" className="field-help">所属先から付与されたアドレスをご入力ください。個人用のフリーメールは登録できません。</p></div>
        <div className="field-row"><div className="field"><label htmlFor="department">担当部署 <strong>必須</strong></label><Input id="department" name="department" autoComplete="organization-title" required maxLength={120} placeholder="例：営業部、人事部" /></div><div className="field"><label htmlFor="title">役職 <small>任意</small></label><Input id="title" name="title" maxLength={120} placeholder="例：マネージャー" /></div></div>
        <div className="field"><label htmlFor="employee-size" id="size-label">従業員・職員規模 <strong>必須</strong></label><select id="employee-size" aria-labelledby="size-label" className="employee-size-select" value={size} onChange={(event)=>setSize(event.target.value)} required><option value="" disabled>人数を選択</option>{sizes.map(item=><option key={item} value={item}>{item}</option>)}</select><p className="field-help">1〜9人の小規模な会社・スタートアップも歓迎です。</p></div>
        <div className="form-heading second"><span>02</span><h2>サービスについて</h2></div>
        <fieldset className="field referral"><legend>社内の人事・総務・導入決裁に関わる方を紹介できますか？ <strong>必須</strong></legend><RadioGroup value={referral} onValueChange={setReferral} className="referral-choices"><label><RadioGroupItem value="yes" /> はい</label><label><RadioGroupItem value="no" /> いいえ</label></RadioGroup><p className="field-help">この段階で紹介する方の氏名や連絡先は不要です。</p></fieldset>
        <div className="field"><label htmlFor="likelihood">ローンチ後、所属先で導入されそうな確率 <strong>必須</strong></label><div className="percentage-field"><Input id="likelihood" name="introductionLikelihood" type="number" inputMode="numeric" min={10} max={99} step={1} required placeholder="10〜99" /><span>%</span></div><p className="field-help">あなたの感覚で大丈夫です。10〜99の数字で入力してください。</p></div>
        <fieldset className="field service-options">
          <legend>導入してほしいサービス・プラン・コース <small>任意・複数選択可</small></legend>
          <p className="field-help">気になるものを選択してください。選んだ順に順位がつき、あとから並べ替えもできます。</p>
          <div className="service-category"><h3>ファッション</h3><div className="service-option-grid">{fashionServices.map((item,index)=><label className="service-option" htmlFor={`fashion-service-${index}`} key={item}><Checkbox id={`fashion-service-${index}`} checked={serviceSelections.includes(item)} onCheckedChange={(checked)=>setServiceSelections(current=>checked===true?(current.includes(item)?current:[...current,item]):current.filter(value=>value!==item))}/><span>{item}</span>{serviceSelections.includes(item)&&<span className="service-rank-badge">{serviceSelections.indexOf(item)+1}位</span>}</label>)}</div></div>
          <div className="service-category"><h3>コスメ・メイク</h3><div className="service-option-grid">{beautyServices.map((item,index)=><label className="service-option" htmlFor={`beauty-service-${index}`} key={item}><Checkbox id={`beauty-service-${index}`} checked={serviceSelections.includes(item)} onCheckedChange={(checked)=>setServiceSelections(current=>checked===true?(current.includes(item)?current:[...current,item]):current.filter(value=>value!==item))}/><span>{item}</span>{serviceSelections.includes(item)&&<span className="service-rank-badge">{serviceSelections.indexOf(item)+1}位</span>}</label>)}</div></div>
          {serviceSelections.length>0&&<div className="service-ranking" aria-live="polite"><h3>希望順位（上が優先）</h3><ol>{serviceSelections.map((item,index)=><li key={item}><span className="service-rank-number">{index+1}位</span><span className="service-rank-name">{item}</span><span className="service-rank-actions"><button type="button" onClick={()=>moveService(item,-1)} disabled={index===0} aria-label={item+"の順位を上げる"}>↑</button><button type="button" onClick={()=>moveService(item,1)} disabled={index===serviceSelections.length-1} aria-label={item+"の順位を下げる"}>↓</button></span></li>)}</ol></div>}
          <div className="field service-other"><label htmlFor="desired-service-other">その他、自由記載 <small>任意</small></label><Textarea id="desired-service-other" name="desiredServiceOther" maxLength={1500} rows={3} placeholder="例：部屋のインテリアサポート、DIYサポートなど" /></div>
        </fieldset>
        <div className="field"><label htmlFor="support-message">応援メッセージ <small>任意</small></label><Textarea id="support-message" name="supportMessage" maxLength={2000} rows={3} placeholder="期待していることなど、自由にお聞かせください。" /></div>
        <div className="website-trap" aria-hidden="true"><label htmlFor="website">ウェブサイト</label><Input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <div className="consent"><Checkbox id="consent" checked={consent} onCheckedChange={(checked)=>setConsent(checked===true)} /><label htmlFor="consent">入力した情報を、事前登録の管理・サービス検討・ローンチ後のご案内や連絡に使うことに同意します。入力内容はサイト上に公開されません。 <strong>必須</strong></label></div>
        {error && <p role="alert" className="form-error">{error}</p>}
        <Button type="submit" disabled={pending} className="registration-submit">{pending ? "送信中…" : "企業・団体として事前登録する　↗"}</Button>
        <p className="registration-small">登録無料。登録をもって導入の申込み・契約にはなりません。</p>
      </form>
    </main>}
  </div>;
}
