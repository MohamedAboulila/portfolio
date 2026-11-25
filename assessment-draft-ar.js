(() => {
  "use strict";
  const D = {"DRAFT PREVIEW, BUILD B4. Nothing you enter here is saved or sent.": "نسخة تجريبية. لن يتم حفظ أو إرسال أي شيء تدخله هنا.", "Building your profile…": "جارٍ إنشاء ملفك…", "Name": "الاسم", "Email": "البريد الإلكتروني", "Anything you want me to know?": "هل هناك ما تود إخباري به؟", "(optional)": "(اختياري)", "Send my results": "أرسل نتائجي", "Sending…": "جارٍ الإرسال…", "Please add your name.": "من فضلك أضف اسمك.", "Please enter a valid email address.": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.", "We couldn’t send that. Check your connection and try again, or email me directly.": "تعذّر الإرسال. تحقق من اتصالك وحاول مرة أخرى، أو راسلني مباشرة.", "Your score is sent with your message. I only use your email to reply.": "تُرسل نتيجتك مع رسالتك. أستخدم بريدك للرد فقط.", "I have your results and will reply by email.": "وصلتني نتائجك وسأرد عليك بالبريد الإلكتروني.", "Leave your details and I will reply with my read of your results.": "اترك بياناتك وسأرد عليك برأيي في نتائجك.", "← Previous": "→ السابق", "Thanks,": "شكرًا،"};
  const originals = new WeakMap();
  const isArabic = () => document.documentElement.lang === "ar";
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue.trim();
      if (isArabic()) {
        if (D[text]) { if (!originals.has(node)) originals.set(node, node.nodeValue); node.nodeValue = node.nodeValue.replace(text, D[text]); }
      } else if (originals.has(node)) { node.nodeValue = originals.get(node); originals.delete(node); }
    } else if (node.nodeType === 1 && node.tagName !== "SCRIPT" && node.tagName !== "STYLE") {
      node.childNodes.forEach(walk);
    }
  }
  let busy = false;
  function run() { if (busy) return; busy = true; walk(document.body); busy = false; }
  new MutationObserver(run).observe(document.body, { subtree: true, childList: true, characterData: true });
  new MutationObserver(run).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  run();
})();
