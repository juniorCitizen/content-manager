require('dotenv-safe').config()

const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')

const companyTitle = process.env.COMPANY_TITLE

const markdownBody = `
# PRIVATE POLICY STATEMENT

This Privacy Policy describes how your personal information is collected,
used and shared when you visit or submit an inquiry from
www.gentry-way.com.tw (*the Site*).

## PERSONAL INFORMATION COLLECTED

When you visit the Site, we automatically collect certain information
about your device, including information about your web browser, IP
address, time zone, and some of the cookies that are installed on your
device. Additionally, as you browse the Site, we collect information about
the individual web pages or products that you view, what websites or
search terms referred you to the Site, and information about how you
interact with the Site. We refer to this automatically-collected
information as "Device Information."

We collect Device Information using the following technologies:

- "Cookies" are data files that are placed on your device or computer and
  often include an anonymous unique identifier. For more information about
  cookies, and how to disable cookies, please visit [allaboutcookies.org](http://www.allaboutcookies.org).

- "Log files" track actions occurring on the Site, and collect data
  including your IP address, browser type, Internet service provider,
  referring / exit pages, and date and time stamps.

Additionally when you submit an inquiry or attempt to make a submission
through the Site, we collect certain information from you, including your
name, company title and email. We refer to this information as "Potential
Client Information."

"Personal Information" mentioned in this Privacy Policy pertains to both
'Device Information' and 'Potential Client Information'.

## HOW ARE YOUR PERSONAL INFORMATION USED

We use the Potential Client Information that we collect generally to
respond to any inquiries submitted through the Site (including processing
your information or product preference). Additionally, we use this
information to:

- communicate with you,

- screen inquries for potential risk or fraud, and

- when in line with the preferences you have shared with us, provide you
  with information or advertising relating to our products or services.

We use the Device Information that we collect to help us screen for
potential risk and fraud (in particular, your IP address), and more
generally to improve and optimize our Site (for example, by generating
analytics about how our customers browse and interact with the Site, and
to assess the success of our marketing strategies).

## SHARING OF YOUR PERSONAL INFORMATION

We use Google Analytics to help us understand how our customers use the
Site. You can read more about how Google uses your Personal Information at
the [Google Privacy & Terms](https://www.google.com/intl/en/policies/privacy)
page. You can also opt-out of Google Analytics [here](https://tools.google.com/dlpage/gaoptout).

We may also share your Personal Information to comply with applicable laws
and regulations, to respond to a subpoena, search warrant or other lawful
request for information we receive, or to otherwise protect our rights.

## DO NOT TRACK

Please note that we do not alter our Site's data collection and use
practices when we see a Do Not Track signal from your browser.

## YOUR RIGHTS

If you are a European resident, you have the right to access personal
information we hold about you and to ask that your personal information be
corrected, updated or deleted. If you would like to exercise this right,
please contact us through the contact information below.

Additionally, if you are a European resident we note that we are
processing your information in order to fulfill contracts we might have
with you (if you make an inquiry through the Site, for example), or
otherwise to pursue our legitimate business interests listed above.
Additionally, please note that your information will be transferred
outside of Europe.

## DATA RETENTION

When you place an order through the Site, we will maintain your
information for our records unless and until you ask us to delete this information.

## CHANGES

We may update this privacy policy from time to time in order to reflect,
for example, changes to our practices or for other operational, legal or
regulatory reasons.

## CONTACT US

For more information about our privacy practices, if you have questions,
or if you would like to make a complaint, please contact us by e-mail at
david.tsai@gentry-way.com.tw or by post mail using the address provided below:

No. 152, Wufu Road, Yanshui District, Tainan City 73742, Taiwan R.O.C.`

module.exports = class Privacy {
  constructor() {
    this.name = 'Privacy Policy Page'
    this.slug = 'privacy'
    this.route = '/privacy'
    this.seo = {
      title: `Privacy Policy | ${companyTitle}`,
      description: 'Gentry Way Co., Ltd. website privacy policy statement',
      keywords: ['privacy policy statement'],
    }
    this.markdownBody = markdownBody
  }

  generate(contentDir) {
    const content =
      matter
        .stringify(this.markdownBody, {
          name: this.name,
          slug: this.slug,
          route: this.route,
          seo: this.seo,
        })
        .trim() + '\n'
    const filePath = path.join(contentDir, 'privacy.md')
    return fs.outputFile(filePath, content)
  }
}
